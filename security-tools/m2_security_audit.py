#!/usr/bin/env python3
"""
Metin2 Fantasy - Secure CLI Administration & Database Audit Engine
Designed by: DevSecOps & Sênior CyberSecurity Specialist
Version: 1.0.0

This utility automates pre-deploy checking and security assessments for the 
Metin2 game database (account/player tables) and local website environments.
"""

import os
import sys
import re
import hashlib
import argparse

# Console styling utilities
class Color:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

def log_header(title):
    print(f"\n{Color.CYAN}{Color.BOLD}" + "="*60)
    print(f" {title.upper()}")
    print("="*60 + f"{Color.END}")

def log_success(msg):
    print(f"[{Color.GREEN}✅ SUCCESS{Color.END}] {msg}")

def log_warn(msg):
    print(f"[{Color.YELLOW}⚠️ WARNING{Color.END}] {msg}")

def log_error(msg):
    print(f"[{Color.RED}🚨 CRITICAL{Color.END}] {msg}")

def log_info(msg):
    print(f"[{Color.BLUE}ℹ️ INFO{Color.END}] {msg}")

def double_sha1_hash(text):
    """
    Standard Metin2 structural password encryption:
    MySQL PASSWORD() equivalent: SHA1(SHA1(password, raw_output)) inside UPPER CASE with leading asterisk.
    """
    first = hashlib.sha1(text.encode('utf-8')).digest()
    second = hashlib.sha1(first).hexdigest().upper()
    return f"*{second}"


class SecurityAuditEngine:
    def __init__(self, target_dir):
        self.target_dir = os.path.abspath(target_dir)
        self.severe_vulnerabilities = 0
        self.warnings = 0

    def run_web_folder_audit(self):
        log_header("Iniciando Verificação de Arquivos Sensíveis")
        
        # Files that should NEVER be exposed / present in production public paths
        prohibited_backups = [
            r'.*\.bak$', r'.*\.sql$', r'.*\.zip$', r'.*\.rar$', r'.*\.tar\.gz$',
            r'composer\.json$', r'package-lock\.json$', r'yarn\.lock$',
            r'^\.env.*', r'^\.git.*', r'^\.github.*', r'Dockerfile.*'
        ]

        try:
            for root, dirs, files in os.walk(self.target_dir):
                # Prune node_modules or large dist folders for performance
                if 'node_modules' in dirs:
                    dirs.remove('node_modules')
                if '.next' in dirs:
                    dirs.remove('.next')
                
                for filename in files:
                    filepath = os.path.join(root, filename)
                    relative_path = os.path.relpath(filepath, self.target_dir)

                    # Check forbidden extension profiles
                    for pattern in prohibited_backups:
                        if re.match(pattern, filename, re.IGNORECASE):
                            log_error(f"Arquivo sensível exposto encontrado: {relative_path}")
                            self.severe_vulnerabilities += 1
                            break

                    # Scan script file lines for credentials exposure
                    if filename.endswith(('.php', '.js', '.py', '.json', '.html')):
                        self.audit_file_secrets(filepath, relative_path)
                        
            if self.severe_vulnerabilities == 0:
                log_success("Nenhum vazamento de credenciais bruta ou arquivo sensível detectado localmente.")
            else:
                log_warn(f"Auditoria finalizada com {self.severe_vulnerabilities} falhas críticas de infraestrutura.")

        except Exception as e:
            log_error(f"Erro durante auditoria de diretório: {str(e)}")

    def audit_file_secrets(self, filepath, rel_path):
        """Scans individual code files for potential hardcoded secrets/passwords."""
        # Common credentials patterns
        secrets_regex = [
            (r'(password|pass|senha|key|token|salt|secret)\s*=\s*[\'"][^\'"]{8,}[\'"]', "Potencial Chave/Senha Bruta identificada"),
            (r'mysql_connect\s*\(', "Uso de função legada e insegura mysql_connect"),
            (r'eval\s*\(', "Uso altamente perigoso de eval() detectado"),
            (r'\b(http|https)://[^:]+:[^@]+@', "URL de infraestrutura contendo login e senha em texto claro")
        ]

        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                for line_idx, line in enumerate(f, 1):
                    for pattern, message in secrets_regex:
                        if re.search(pattern, line, re.IGNORECASE):
                            # Ensure we don't alert double quotes on placeholder tags
                            if 'placeholder=' in line:
                                continue
                            log_warn(f"[{rel_path}:{line_idx}] {message}")
                            self.warnings += 1
        except Exception:
            pass

    def check_metin2_firewall(self, host="127.0.0.1"):
        """Checks if standard high-risk Metin2 ports are dangerously public."""
        import socket
        log_header(f"Varredura de Portas de Estabilização do Servidor de Jogos — {host}")
        
        # Standard structural ports for Metin2
        m2_ports = {
            22:   ("SSH", False),           # Secure if key-based, warn if open
            3306: ("MySQL Database Server", False), # High critical risk if exposed publicly
            11002: ("M2 Auth Core", True),     # Must be accessible dynamically to game client
            13000: ("M2 Channel 1 Core", True),# Game Channel
            13001: ("M2 Channel 2 Core", True),# Game Channel
            13099: ("M2 Game DB Core", False), # DB Core communication - must NEVER be public
        }

        exposed_db_ports = 0
        for port, (service_name, client_facing) in m2_ports.items():
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.5)
            result = s.connect_ex((host, port))
            s.close()

            if result == 0:
                if not client_facing:
                    log_error(f"Porta CRÍTICA {port} ({service_name}) está ABERTA publicamente no IP {host}!")
                    exposed_db_ports += 1
                    self.severe_vulnerabilities += 1
                else:
                    log_info(f"Porta do Game Client {port} ({service_name}) ativa/escutando de forma esperada.")
            else:
                if not client_facing:
                    log_success(f"Porta de Infraestrutura Interna {port} ({service_name}) fechada/bloqueada (Segura).")

        if exposed_db_ports > 0:
            log_warn("AÇÃO REQUERIDA: Bloqueie o tráfego da porta 3306 e 13099 via iptables exceto de hosts aprovados.")


def main():
    parser = argparse.ArgumentParser(description="Metin2 Fantasy Security Assessment Engine")
    parser.add_argument('--path', default='.', help='Diretório raiz para verificação web')
    parser.add_argument('--hash', help='Gera hash de senha seguro mimetizando criptografia do banco de dados Metin2')
    parser.add_argument('--scan', help='IP Host do Metin2 para validação de regras de firewall internas (DDoS/Exposição)')
    
    args = parser.parse_args()

    # Password generation routine
    if args.hash:
        hashed = double_sha1_hash(args.hash)
        log_header("Gerador de Password Hash Metin2")
        log_info(f"Senha original: {args.hash}")
        log_success(f"Formato SQL (DB Account): {hashed}")
        print(f"\nSubstitua na coluna `password` da tabela `account`: {Color.BOLD}UPDATE account SET password = '{hashed}' WHERE login = 'guerreiro';{Color.END}\n")
        sys.exit(0)

    # Core audit execution
    engine = SecurityAuditEngine(args.path)
    engine.run_web_folder_audit()

    if args.scan:
        engine.check_metin2_firewall(args.scan)

    # Output executive audit status summary block 
    log_header("Status Final Da Auditoria de Segurança")
    print(f"Total Falhas Críticas Encontradas: {Color.RED if engine.severe_vulnerabilities > 0 else Color.GREEN}{engine.severe_vulnerabilities}{Color.END}")
    print(f"Total Alertas Emitidos: {Color.YELLOW if engine.warnings > 0 else Color.GREEN}{engine.warnings}{Color.END}")
    
    if engine.severe_vulnerabilities == 0:
        log_success("Parabéns! Infraestrutura atende aos rigorosos critérios do manual DevSecOps Metin2.")
        sys.exit(0)
    else:
        log_error("AUDITORIA REPROVADA. Corrija as vulnerabilidades críticas listadas antes de iniciar o deploy.")
        sys.exit(1)

if __name__ == '__main__':
    main()
