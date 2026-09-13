import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/auth/auth_state.dart';
import 'package:mobile/core/auth/auth_state_provider.dart';
import 'package:mobile/features/auth/auth_routes.dart';
import 'package:mobile/main.dart';

class _RouterRefreshNotifier extends ChangeNotifier {
  _RouterRefreshNotifier(Ref ref) {
    ref.listen(authStateProvider, (previous, next) {
      notifyListeners();
    });
  }
}

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  final refreshNotifier = _RouterRefreshNotifier(ref);

  return GoRouter(
    refreshListenable: refreshNotifier,
    redirect: (context, state) {
      final isAuthenticated = authState.value == AuthState.authenticated;
      final isPublicRoute =
          state.matchedLocation == '/login' ||
          state.matchedLocation == '/register';

      if (!isAuthenticated && !isPublicRoute) return '/login';
      if (isAuthenticated && isPublicRoute) return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (context, state) => const MainScreen()),
      ...authRoutes,
    ],
  );
});
