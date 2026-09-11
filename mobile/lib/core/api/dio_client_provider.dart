import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/api/auth_interceptor.dart';
import 'package:mobile/core/storage/secure_storage_service_provider.dart';

final dioClientProvider = Provider<Dio>((ref) {
  final storageService = ref.read(secureStorageServiceProvider);

  final dio = Dio(
    BaseOptions(
      baseUrl: 'http://localhost:8080/api',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      sendTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ),
  );

  dio.interceptors.add(AuthInterceptor(dio, storageService));

  return dio;
});
