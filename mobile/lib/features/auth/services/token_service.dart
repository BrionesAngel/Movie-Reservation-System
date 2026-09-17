import 'package:dio/dio.dart';
import 'package:mobile/features/auth/models/auth_models.dart';
import 'package:mobile/features/auth/services/secure_storage_service.dart';

class TokenService {
  final Dio refreshDio;
  final SecureStorageService secureStorageService;

  TokenService(this.refreshDio, this.secureStorageService);

  Future<String?> getAccessToken() => secureStorageService.getAccessToken();
  Future<String?> getRefreshToken() => secureStorageService.getRefreshToken();

  Future<void> logout(String refreshToken) async {
    try {
      await refreshDio.post(
        '/auth/logout',
        data: {'refreshToken': refreshToken},
      );
    } finally {
      await clearTokens();
    }
  }

  Future<void> refresh(String refreshToken) async {
    final response = await refreshDio.post(
      '/auth/refresh',
      data: {'refreshToken': refreshToken},
    );
    final authResponse = RefreshResponse.fromJson(response.data);
    await saveAccessToken(authResponse.accessToken);
  }

  Future<void> saveAccessToken(String access) async {
    await secureStorageService.saveAccessToken(access);
  }

  Future<void> saveTokens(String access, String refresh) async {
    await secureStorageService.saveAccessToken(access);
    await secureStorageService.saveRefreshToken(refresh);
  }

  Future<void> clearTokens() async {
    await secureStorageService.deleteAccessToken();
    await secureStorageService.deleteRefreshToken();
  }
}
