import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/api/auth_interceptor.dart';
import 'package:mobile/features/auth/providers/token_service_provider.dart';

final dioClientProvider = Provider<Dio>((ref) {
  final tokenService = ref.read(tokenServiceProvider);
  final dio = Dio(
    BaseOptions(
      baseUrl: 'http://localhost:8080/api',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      sendTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ),
  );

  dio.interceptors.add(AuthInterceptor(dio, tokenService, ref));

  return dio;
});
