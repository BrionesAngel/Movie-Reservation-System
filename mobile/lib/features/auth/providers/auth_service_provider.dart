import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/api/dio_client_refresh_provider.dart';
import 'package:mobile/features/auth/providers/token_service_provider.dart';
import 'package:mobile/features/auth/services/auth_service.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  final refreshDio = ref.read(dioClientRefreshProvider);
  final tokenService = ref.read(tokenServiceProvider);

  return AuthService(refreshDio, tokenService);
});
