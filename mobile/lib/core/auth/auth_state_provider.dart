import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/auth/auth_notifier.dart';
import 'package:mobile/core/auth/auth_state.dart';

final authStateProvider = AsyncNotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);
