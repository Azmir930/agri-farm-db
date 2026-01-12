<?php
/**
 * Admin Payment Management
 * Agriculture Product Marketplace
 */

require_once '../config/database.php';
require_once '../config/helpers.php';
require_once '../auth/middleware.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

try {
    $user = requireApiRole('admin');
    $database = new Database();
    $conn = $database->getConnection();

    switch ($method) {
        case 'GET':
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 20);
            $status = sanitize($_GET['status'] ?? '');
            $payment_method = sanitize($_GET['payment_method'] ?? '');
            $date_from = sanitize($_GET['date_from'] ?? '');
            $date_to = sanitize($_GET['date_to'] ?? '');

            $where = "WHERE 1=1";
            $params = [];

            if ($status) {
                $where .= " AND p.status = ?";
                $params[] = $status;
            }

            if ($payment_method) {
                $where .= " AND p.payment_method = ?";
                $params[] = $payment_method;
            }

            if ($date_from) {
                $where .= " AND DATE(p.created_at) >= ?";
                $params[] = $date_from;
            }

            if ($date_to) {
                $where .= " AND DATE(p.created_at) <= ?";
                $params[] = $date_to;
            }

            // Get total
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM Payment p $where");
            $stmt->execute($params);
            $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            $pagination = getPagination($page, $limit, $total);

            $params[] = $limit;
            $params[] = $pagination['offset'];

            $stmt = $conn->prepare("
                SELECT p.*, o.id as order_id, o.status as order_status,
                       u.first_name, u.last_name, u.email
                FROM Payment p
                JOIN Orders o ON p.order_id = o.id
                JOIN Buyer b ON o.buyer_id = b.id
                JOIN User u ON b.user_id = u.id
                $where
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute($params);
            $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get summary stats
            $stmt = $conn->prepare("
                SELECT 
                    COUNT(*) as total_payments,
                    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_received,
                    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
                    SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) as total_refunded
                FROM Payment
            ");
            $stmt->execute();
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);

            jsonResponse([
                'success' => true,
                'data' => $payments,
                'stats' => $stats,
                'pagination' => $pagination
            ]);
            break;

        case 'PUT':
            // Update payment status
            $data = json_decode(file_get_contents("php://input"), true);
            $payment_id = sanitize($data['id'] ?? $_GET['id'] ?? '');
            $status = sanitize($data['status'] ?? '');

            if (empty($payment_id)) {
                jsonResponse(['error' => 'Payment ID is required'], 400);
            }

            $valid_statuses = ['pending', 'completed', 'failed', 'refunded'];
            
            if (!in_array($status, $valid_statuses)) {
                jsonResponse(['error' => 'Invalid status'], 400);
            }

            $conn->beginTransaction();

            $updates = ["status = ?", "updated_at = NOW()"];
            $params = [$status];

            if ($status === 'completed') {
                $updates[] = "paid_at = NOW()";
            }

            if (isset($data['transaction_id'])) {
                $updates[] = "transaction_id = ?";
                $params[] = sanitize($data['transaction_id']);
            }

            $params[] = $payment_id;

            $stmt = $conn->prepare("UPDATE Payment SET " . implode(', ', $updates) . " WHERE id = ?");
            $stmt->execute($params);

            // If refunded, update order status
            if ($status === 'refunded') {
                $stmt = $conn->prepare("
                    UPDATE Orders o
                    JOIN Payment p ON o.id = p.order_id
                    SET o.status = 'refunded', o.updated_at = NOW()
                    WHERE p.id = ?
                ");
                $stmt->execute([$payment_id]);
            }

            $conn->commit();

            jsonResponse([
                'success' => true,
                'message' => 'Payment updated successfully'
            ]);
            break;

        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    jsonResponse(['error' => 'Operation failed: ' . $e->getMessage()], 500);
}
?>
