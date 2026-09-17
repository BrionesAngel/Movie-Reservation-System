class RefreshResponse {
  final String accessToken;

  RefreshResponse({required this.accessToken});

  factory RefreshResponse.fromJson(Map<String, dynamic> json) {
    return RefreshResponse(accessToken: json['accessToken']);
  }
}
