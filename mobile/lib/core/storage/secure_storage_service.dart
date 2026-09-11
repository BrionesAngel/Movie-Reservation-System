import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  final FlutterSecureStorage storage;

  SecureStorageService(this.storage);

  Future<void> saveAccessToken(String token) async {
    await storage.write(key: 'access_token', value: token);
  }

  Future<String?> getAccessToken() async {
    return storage.read(key: 'access_token');
  }

  Future<void> deleteAccessToken() async {
    await storage.delete(key: 'access_token');
  }
}
