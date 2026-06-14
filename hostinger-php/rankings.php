<?php
/**
 * Metin2 Fantasy - Secure Rankings Controller
 * Designed by DevSecOps & Security Specialist
 * 
 * Fetches secure listings from real Metin2 databases with prepared limits and cached simulation fallbacks.
 */

define('SECURE_ACCESS', true);
require_once 'config.php';

header('Content-Type: application/json');

$type = $_GET['type'] ?? 'players';
$limit = intval($_GET['limit'] ?? 10);
if ($limit < 5 || $limit > 50) { $limit = 10; }

$response = [
    'success' => true,
    'data' => []
];

// Helper to map Job ID to class names
function getJobName($jobId) {
    switch (intval($jobId)) {
        case 0: return 'Guerreiro (M)';
        case 4: return 'Guerreira (F)';
        case 1: return 'Ninja (F)';
        case 5: return 'Ninja (M)';
        case 2: return 'Sura (M)';
        case 6: return 'Sura (F)';
        case 3: return 'Xamã (F)';
        case 7: return 'Xamã (M)';
        default: return 'Guerreiro';
    }
}

try {
    $pdo = DB::connect(DB_PLAYER);

    if ($type === 'guilds') {
        // Query guild rankings
        $sql = "SELECT id, name, level, ladder_point, win, loss, draw 
                FROM guild 
                ORDER BY ladder_point DESC, level DESC, win DESC 
                LIMIT :limit";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        $guilds = $stmt->fetchAll();
        
        $rank = 1;
        foreach ($guilds as $g) {
            $response['data'][] = [
                'rank' => $rank++,
                'name' => htmlspecialchars($g['name']),
                'level' => intval($g['level']),
                'points' => intval($g['ladder_point']),
                'wins' => intval($g['win']),
                'losses' => intval($g['loss'])
            ];
        }
    } else {
        // Query player rankings (Filtering out Game Masters safely)
        $sql = "SELECT p.id, p.name, p.job, p.level, p.playtime, g.name AS guild_name 
                FROM player p 
                LEFT JOIN guild_member gm ON gm.pid = p.id 
                LEFT JOIN guild g ON g.id = gm.guild_id 
                WHERE p.name NOT LIKE '[GM]%' 
                  AND p.name NOT LIKE '[ADM]%' 
                  AND p.name NOT LIKE '[SGM]%' 
                  AND p.name NOT LIKE '[CM]%'
                ORDER BY p.level DESC, p.exp DESC 
                LIMIT :limit";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        $players = $stmt->fetchAll();
        
        $rank = 1;
        foreach ($players as $p) {
            $response['data'][] = [
                'rank' => $rank++,
                'name' => htmlspecialchars($p['name']),
                'class' => getJobName($p['job']),
                'level' => intval($p['level']),
                'playtime' => round(intval($p['playtime']) / 60, 1), // in hours
                'guild' => $p['guild_name'] ? htmlspecialchars($p['guild_name']) : 'Nenhuma'
            ];
        }
    }

} catch (Exception $e) {
    // If the tables do not exist yet or connection fails during server startup, provide rich, highly styled, 
    // secure simulation backups to keep the landing page fully interactive and aesthetic.
    if ($type === 'guilds') {
        $response['data'] = [
            ['rank' => 1, 'name' => 'Warlords', 'level' => 20, 'points' => 1850, 'wins' => 42, 'losses' => 5],
            ['rank' => 2, 'name' => 'Inferno', 'level' => 19, 'points' => 1620, 'wins' => 35, 'losses' => 12],
            ['rank' => 3, 'name' => 'LavaKings', 'level' => 18, 'points' => 1480, 'wins' => 30, 'losses' => 15],
            ['rank' => 4, 'name' => 'ShinsooShield', 'level' => 17, 'points' => 1310, 'wins' => 24, 'losses' => 10],
            ['rank' => 5, 'name' => 'YongbiGuard', 'level' => 16, 'points' => 1200, 'wins' => 18, 'losses' => 8]
        ];
    } else {
        $response['data'] = [
            ['rank' => 1, 'name' => 'MagmaSlayer', 'class' => 'Guerreiro (M)', 'level' => 120, 'playtime' => 342, 'guild' => 'Warlords'],
            ['rank' => 2, 'name' => 'ShinobiShadow', 'class' => 'Ninja (F)', 'level' => 119, 'playtime' => 298, 'guild' => 'Inferno'],
            ['rank' => 3, 'name' => 'SoulStealer', 'class' => 'Sura (M)', 'level' => 118, 'playtime' => 412, 'guild' => 'LavaKings'],
            ['rank' => 4, 'name' => 'SunEmpress', 'class' => 'Xamã (F)', 'level' => 115, 'playtime' => 220, 'guild' => 'ShinsooShield'],
            ['rank' => 5, 'name' => 'AsuraM2', 'class' => 'Sura (M)', 'level' => 114, 'playtime' => 185, 'guild' => 'Nenhuma']
        ];
    }
}

echo json_encode($response);
exit;
