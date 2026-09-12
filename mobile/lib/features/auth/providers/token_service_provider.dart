import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/api/dio_client_refresh_provider.dart';
import 'package:mobile/features/auth/services/token_service.dart';
import 'package:mobile/features/auth/providers/secure_storage_service_provider.dart';

final tokenServiceProvider = Provider((ref) {
  final refreshDio = ref.read(dioClientRefreshProvider);
  final secureStorageService = ref.read(secureStorageServiceProvider);

  return TokenService(refreshDio, secureStorageService);
});
