<?php
// Shared CORS utilities for API endpoints

function setupCors(array $options = []): array
{
	$defaultOrigins = [
		'http://localhost',
		'http://localhost:80',
		'http://127.0.0.1',
		'http://127.0.0.1:80',
		'null'
	];

	$allowedOrigins = array_values(array_unique(array_merge($defaultOrigins, $options['origins'] ?? [])));
	$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
	$isAllowedOrigin = $origin === '' || in_array($origin, $allowedOrigins, true);

	if ($origin !== '' && !$isAllowedOrigin) {
		header('HTTP/1.1 403 Forbidden');
		header('Content-Type: application/json');
		echo json_encode(['success' => false, 'error' => 'Origin not allowed']);
		exit;
	}

	if ($origin === '') {
		header('Access-Control-Allow-Origin: *');
	} else {
		header('Access-Control-Allow-Origin: ' . $origin);
		header('Access-Control-Allow-Credentials: true');
	}

	header('Vary: Origin');

	$methods = $options['methods'] ?? ['GET', 'POST', 'OPTIONS'];
	$headers = $options['headers'] ?? ['Content-Type', 'X-Requested-With'];
	if (!in_array('X-Session-Id', $headers, true)) {
		$headers[] = 'X-Session-Id';
	}

	header('Access-Control-Allow-Methods: ' . implode(', ', $methods));
	header('Access-Control-Allow-Headers: ' . implode(', ', $headers));

	return [$origin, $isAllowedOrigin];
}

function handleCorsPreflight(string $origin): void
{
	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
		if ($origin !== '') {
			header('Access-Control-Allow-Credentials: true');
		}
		http_response_code(204);
		exit;
	}
}
