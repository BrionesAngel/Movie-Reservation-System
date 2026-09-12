import 'package:mobile/features/auth/services/secure_storage_service.dart';
import 'package:mobile/features/auth/providers/secure_storage_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final secureStorageServiceProvider = Provider<SecureStorageService>((ref) {
  final storage = ref.read(secureStorageProvider);
  return SecureStorageService(storage);
});
