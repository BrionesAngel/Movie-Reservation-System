import 'package:dio/dio.dart';
import 'package:mobile/features/auth/models/core_models.dart';
import 'package:mobile/features/auth/services/token_service.dart';

class AuthService {
  final Dio refreshDio;
  final TokenService tokenService;

  AuthService(this.refreshDio, this.tokenService);

  Future<AuthResponse> login(LoginRequest request) async {
    final response = await refreshDio.post('/auth/login', data: request);
    final authResponse = AuthResponse.fromJson(response.data);
    await tokenService.saveTokens(
      authResponse.accessToken,
      authResponse.refreshToken,
    );
    return authResponse;
  }

  Future<AuthResponse> register(RegisterRequest request) async {
    final response = await refreshDio.post('/auth/register', data: request);
    final authResponse = AuthResponse.fromJson(response.data);
    await tokenService.saveTokens(
      authResponse.accessToken,
      authResponse.refreshToken,
    );
    return authResponse;
  }

  Future<void> logout(String refreshToken) async {
    try {
      await refreshDio.post(
        '/auth/logout',
        data: {'refreshToken': refreshToken},
      );
    } finally {
      await tokenService.clearTokens();
    }
  }
}
