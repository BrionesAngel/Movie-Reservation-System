import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/auth/auth_state_provider.dart';
import 'package:mobile/core/api/dio_client_provider.dart';
import 'package:mobile/features/auth/providers/auth_service_provider.dart';
import 'package:mobile/features/auth/providers/token_service_provider.dart';

class TestScreen extends ConsumerWidget {
  const TestScreen({super.key});

  Future<void> _testApiCall(WidgetRef ref) async {
    try {
      final dio = ref.read(dioClientProvider);
      print('--- Haciendo peticion de prueba ---');
      final response = await dio.get('/test'); // cambia por uno real
      print('Respuesta OK: ${response.statusCode} - ${response.data}');
    } catch (e) {
      print('ERROR en peticion de prueba: $e');
    }
  }

  Future<void> _testLogout(WidgetRef ref) async {
    try {
      final tokenService = ref.read(tokenServiceProvider);
      final authService = ref.read(authServiceProvider);
      final refreshToken = await tokenService.getRefreshToken();
      if (refreshToken != null) {
        await authService.logout(refreshToken);
      }
      ref.read(authStateProvider.notifier).setUnauthenticated();
      print('--- Logout ejecutado ---');
    } catch (e) {
      print('ERROR en logout: $e');
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Test Screen')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ElevatedButton(
              onPressed: () => _testApiCall(ref),
              child: const Text('Test API call'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => _testLogout(ref),
              child: const Text('Logout'),
            ),
          ],
        ),
      ),
    );
  }
}
