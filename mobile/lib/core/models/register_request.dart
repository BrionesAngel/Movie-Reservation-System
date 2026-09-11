class RegisterRequest{
  final String username;
  final String email;
  final String password;

  RegisterRequest({
    required this.username,
    required this.email,
    required this.password,
  });

  factory RegisterRequest.fromJson(Map<String, dynamic> json){
    return RegisterRequest(
      username: json['username'],
      email: json['email'],
      password: json['password']
    );
  }
}
