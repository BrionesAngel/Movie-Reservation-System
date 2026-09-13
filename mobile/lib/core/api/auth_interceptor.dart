import 'package:dio/dio.dart';
import 'package:mobile/features/auth/services/token_service.dart';

class AuthInterceptor extends Interceptor {
  final Dio dio;
  final TokenService tokenService;

  AuthInterceptor(this.dio, this.tokenService);

  Future<void>? _refreshFuture;

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await tokenService.getAccessToken();
    if (token != null) options.headers['Authorization'] = 'Bearer $token';

    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final path = err.requestOptions.path;
    final isAuthEndpoint =
        path.contains('/auth/login') ||
        path.contains('/auth/register') ||
        path.contains('/auth/refresh');

    final isRetry = err.requestOptions.extra['isRetry'] == true;

    if (err.response?.statusCode == 401 && !isAuthEndpoint && !isRetry) {
      try {
        _refreshFuture ??= _doRefresh();
        await _refreshFuture;

        final newToken = await tokenService.getAccessToken();
        final opts = err.requestOptions;
        opts.headers['Authorization'] = 'Bearer $newToken';
        opts.extra['isRetry'] = true;

        final response = await dio.fetch(opts);
        return handler.resolve(response);
      } catch (e) {
        await tokenService.clearTokens();
        return handler.next(err);
      } finally {
        _refreshFuture = null;
      }
    }
    handler.next(err);
  }

  Future<void> _doRefresh() async {
    final refreshToken = await tokenService.getRefreshToken();
    if (refreshToken == null) throw Exception('No refresh token');
    await tokenService.refresh(refreshToken);
  }
}
