import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/auth/auth_state.dart';
import 'package:mobile/features/auth/providers/token_service_provider.dart';

class AuthNotifier extends AsyncNotifier<AuthState> {
  @override
  Future<AuthState> build() async {
    final token = await ref.watch(tokenServiceProvider).getAccessToken();
    return token != null ? AuthState.authenticated : AuthState.unauthenticated;
  }

  void setAuthenticated() {
    state = const AsyncData(AuthState.authenticated);
  }

  void setUnauthenticated() {
    state = const AsyncData(AuthState.unauthenticated);
  }
}
