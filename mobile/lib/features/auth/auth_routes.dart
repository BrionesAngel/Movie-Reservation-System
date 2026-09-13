import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/screens/login_screen.dart';
import 'package:mobile/features/auth/screens/register_screen.dart';

final authRoutes = [
  GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
  GoRoute(
    path: '/register',
    builder: (context, state) => const RegisterScreen(),
  ),
];
