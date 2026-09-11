import 'package:dio/dio.dart';
import 'package:mobile/core/storage/secure_storage_service.dart';

class AuthInterceptor extends Interceptor {
  final Dio dio;
  final SecureStorageService storageService;

  AuthInterceptor(this.dio, this.storageService);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await storageService.getAccessToken();
    if (token != null) options.headers['Authorization'] = 'Bearer $token';

    handler.next(options);
  }
}
