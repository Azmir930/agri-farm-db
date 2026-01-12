<?php
/**
 * Live Search API
 * Agriculture Product Marketplace
 */

require_once '../config/database.php';
require_once '../config/helpers.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

try {
    $database = new Database();
    $conn = $database->getConnection();

    $query = sanitize($_GET['q'] ?? '');
    $type = sanitize($_GET['type'] ?? 'products'); // products, farmers, categories
    $limit = min(intval($_GET['limit'] ?? 10), 20);

    if (strlen($query) < 2) {
        jsonResponse(['error' => 'Query must be at least 2 characters'], 400);
    }

    $results = [];

    switch ($type) {
        case 'products':
            $stmt = $conn->prepare("
                SELECT p.id, p.name, p.price, c.name as category,
                       (SELECT image_url FROM Product_Image WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image
                FROM Product p
                JOIN Category c ON p.category_id = c.id
                WHERE p.is_active = TRUE 
                AND p.stock_quantity > 0
                AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)
                ORDER BY 
                    CASE WHEN p.name LIKE ? THEN 1
                         WHEN p.name LIKE ? THEN 2
                         ELSE 3 END,
                    p.name
                LIMIT ?
            ");
            $stmt->execute([
                "%$query%", "%$query%", "%$query%",
                "$query%", "%$query%",
                $limit
            ]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;

        case 'farmers':
            $stmt = $conn->prepare("
                SELECT f.id, f.farm_name, f.farm_location,
                       u.first_name, u.last_name,
                       (SELECT COUNT(*) FROM Product WHERE farmer_id = f.id AND is_active = TRUE) as product_count
                FROM Farmer f
                JOIN User u ON f.user_id = u.id
                WHERE u.is_active = TRUE
                AND (f.farm_name LIKE ? OR f.farm_location LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)
                ORDER BY f.farm_name
                LIMIT ?
            ");
            $stmt->execute(["%$query%", "%$query%", "%$query%", "%$query%", $limit]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;

        case 'categories':
            $stmt = $conn->prepare("
                SELECT c.id, c.name, c.description,
                       (SELECT COUNT(*) FROM Product WHERE category_id = c.id AND is_active = TRUE) as product_count
                FROM Category c
                WHERE c.is_active = TRUE
                AND (c.name LIKE ? OR c.description LIKE ?)
                ORDER BY c.name
                LIMIT ?
            ");
            $stmt->execute(["%$query%", "%$query%", $limit]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;

        case 'all':
            // Search across all types
            $stmt = $conn->prepare("
                SELECT 'product' as type, p.id, p.name as title, c.name as subtitle,
                       (SELECT image_url FROM Product_Image WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image
                FROM Product p
                JOIN Category c ON p.category_id = c.id
                WHERE p.is_active = TRUE AND (p.name LIKE ? OR c.name LIKE ?)
                UNION ALL
                SELECT 'farmer' as type, f.id, f.farm_name as title, f.farm_location as subtitle, NULL as image
                FROM Farmer f
                JOIN User u ON f.user_id = u.id
                WHERE u.is_active = TRUE AND f.farm_name LIKE ?
                UNION ALL
                SELECT 'category' as type, c.id, c.name as title, c.description as subtitle, NULL as image
                FROM Category c
                WHERE c.is_active = TRUE AND c.name LIKE ?
                LIMIT ?
            ");
            $stmt->execute(["%$query%", "%$query%", "%$query%", "%$query%", $limit]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;

        default:
            jsonResponse(['error' => 'Invalid search type'], 400);
    }

    jsonResponse([
        'success' => true,
        'query' => $query,
        'type' => $type,
        'count' => count($results),
        'data' => $results
    ]);

} catch (Exception $e) {
    jsonResponse(['error' => 'Search failed: ' . $e->getMessage()], 500);
}
?>
