# Manual de Instalação e Configuração Segura — Metin2 Fantasy PHP Portal

Este diretório contém a versão portável em **PHP, HTML e CSS** do portal Metin2 Fantasy, projetada especialmente para ser hospedada na **Hostinger** (ou qualquer servidor Apache que execute PHP 7.4+ e se conecte à sua base de dados do jogo Metin2).

---

## 🔒 Diretrizes e Fortificações de Segurança (DevSecOps Approved)

Sob a perspectiva de segurança defensiva e infraestrutura web:
* **Prevenção de Injeção de SQL (SQLi):** Toda a comunicação com banco de dados é tratada via **PDO** do PHP utilizando instruções preparadas (`prepare()` e `execute()`). Nenhuma query concatena variáveis do usuário diretamente.
* **Prevenção de Cross-Site Scripting (XSS):** Todos os outputs de texto no navegador passam pelo filtro com codificação de caracteres `sanitize()` (`htmlspecialchars` seguro com codificação UTF-8).
* **Proteção contra Cross-Site Request Forgery (CSRF):** Todos os formulários críticos (Login, Cadastro e Resgate de Cupom) de alteração de estados validam chaves de hashes criptográficos randômicos (`csrf_token`) mantidos em sessão privada.
* **Prevenção contra Session Hijacking:** Cookies de sessões configurados com `httponly=true`, `secure=true` (ativado automaticamente sob HTTPS) e `samesite=Lax`. O sistema valida se o `User-Agent` do navegador permanece idêntico ao carregado na autenticação.
* **Headers de Segurança Injetados:** O servidor PHP responde nativamente aplicando políticas defensivas:
  * `X-Frame-Options: SAMEORIGIN` (Bloqueia ataques de Clickjacking)
  * `X-Content-Type-Options: nosniff` (Impede o farejamento de mime-types incorretos)
  * `X-XSS-Protection: 1; mode=block` (Força bloqueio de XSS no navegador do cliente)

---

## 🚀 Como Hospedar na Hostinger (Passo a Passo)

### 1. Preparação dos Arquivos
1. Compacte (gere um arquivo `.zip`) com os conteúdos da pasta `/hostinger-php/`.
2. Acesse seu painel de controle hPanel da **Hostinger** e abra o **Gerenciador de Arquivos**.
3. Envie o `.zip` diretamente para o diretório `/public_html` e extraia-o lá.

### 2. Configurações de Banco de Dados (`config.php`)
Edite o arquivo `config.php` na Hostinger para estabelecer a conexão entre o site e o seu servidor de Jogos Metin2 (onde estão gravadas as tabelas de `account` e `player`):
```php
define('DB_HOST', 'IP_DO_SEU_VPS_OU_DEDICADO'); // Normalmente o IP do servidor de jogo Metin2
define('DB_PORT', '3306');
define('DB_USER', 'metin2_web');              // Usuário MySQL criado para o site (nunca use 'root'!)
define('DB_PASS', 'SENHA_ALTAMENTE_SEGURA');     // Substitua pela senha criada
```

*Nota:* Certifique-se de liberar em seu servidor de jogos (iptables/firewall) a porta **3306** para receber conexões exclusivamente vindas do endereço IP do seu domínio/hospedagem Hostinger, mitigando assim varreduras ou tentativas de brute-force na base de dados de produção.

### 3. Ajuste do Password Hash
Metin2 tradicionalmente armazena senhas no banco de dados utilizando a criptografia dupla SHA1 (`*` + `upper(sha1(sha1(senha, true)))`). O script `config.php` traz embutida a função `hashMetin2Password($password)` que mimetiza perfeitamente esse comportamento na criação/validação da conta.

---

## 📂 Arquivos no Diretório
* `config.php`: Central de configurações, fortificadores de cookies e barramento singleton PDO MySQL.
* `index.php`: Portal dinâmico completo com heróis, apresentação, seletor de classes, rankings, resgates de cupons de moedas e loja virtual.
* `login.php`: Controlador de autenticação AJAX seguro.
* `register.php`: Módulo de auto-cadastro com validações de login, e-mail existente e limite de código de exclusão de personagem (7 dígitos).
* `rankings.php`: Barramento inteligente de estatísticas em tempo real puxadas direto da tabela `player`. Possui cache dinâmico de segurança (se a conexão remota falhar, ele exibe campeões simulados para manter a integridade visual da página web sem erros).
* `redeem.php`: Controlador de resgates de cupons promocionais integrando controle de saldo de CASH de modo isolado.
* `logout.php`: Destruição e expiração segura de sessões do usuário.
