import 'package:dio/dio.dart';
import 'package:mobile/core/services/secure_storage_service.dart';
import 'package:mobile/core/models/core_models.dart';

class AuthService {
  final SecureStorageService secureStorageService;
  final Dio dio;

  AuthService(this.secureStorageService, this.dio);

  Future<AuthResponse> login(LoginRequest request) async {
    final response = await dio.post('/auth/login', data: request);
    final authResponse = AuthResponse.fromJson(response.data);
    await saveTokens(authResponse.accessToken, authResponse.refreshToken);
    return authResponse;
  }

  Future<AuthResponse> register(RegisterRequest request) async {
    final response = await dio.post('/auth/register', data: request);
    final authResponse = AuthResponse.fromJson(response.data);
    await saveTokens(authResponse.accessToken, authResponse.refreshToken);
    return authResponse;
  }

  Future<void> logout(String refreshToken) async {
    try {
      await dio.post('/auth/logout', data: {'refreshToken': refreshToken});
    } finally {
      await clearTokens();
    }
  }

  Future<void> saveTokens(String accessToken, String refreshToken) async {
    await secureStorageService.saveAccessToken(accessToken);
    await secureStorageService.saveRefreshToken(refreshToken);
  }

  Future<void> clearTokens() async {
    await secureStorageService.deleteAccessToken();
    await secureStorageService.deleteRefreshToken();
  }
}
