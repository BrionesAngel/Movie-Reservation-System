import 'package:dio/dio.dart';
import 'package:mobile/features/auth/models/auth_models.dart';
import 'package:mobile/features/auth/services/secure_storage_service.dart';

class TokenService {
  final Dio refreshDio;
  final SecureStorageService secureStorageService;

  TokenService(this.refreshDio, this.secureStorageService);

  Future<String?> getAccessToken() => secureStorageService.getAccessToken();
  Future<String?> getRefreshToken() => secureStorageService.getRefreshToken();

  Future<void> refresh(String refreshToken) async {
    final response = await refreshDio.post(
      '/auth/refresh',
      data: {'refreshToken': refreshToken},
    );
    final authResponse = AuthResponse.fromJson(response.data);
    await saveTokens(authResponse.accessToken, authResponse.refreshToken);
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
