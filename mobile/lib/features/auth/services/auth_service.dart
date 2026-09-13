import 'package:dio/dio.dart';
import 'package:mobile/features/auth/models/auth_models.dart';
import 'package:mobile/features/auth/services/token_service.dart';

class AuthService {
  final Dio dio;
  final TokenService tokenService;

  AuthService(this.dio, this.tokenService);

  Future<AuthResponse> login(LoginRequest request) async {
    final response = await dio.post('/auth/login', data: request.toJson());
    final authResponse = AuthResponse.fromJson(response.data);
    await tokenService.saveTokens(
      authResponse.accessToken,
      authResponse.refreshToken,
    );
    return authResponse;
  }

  Future<AuthResponse> register(RegisterRequest request) async {
    final response = await dio.post('/auth/register', data: request);
    final authResponse = AuthResponse.fromJson(response.data);
    await tokenService.saveTokens(
      authResponse.accessToken,
      authResponse.refreshToken,
    );
    return authResponse;
  }

  Future<void> logout(String refreshToken) async {
    try {
      await dio.post('/auth/logout', data: {'refreshToken': refreshToken});
    } finally {
      await tokenService.clearTokens();
    }
  }
}
