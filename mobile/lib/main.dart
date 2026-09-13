import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/router/router_provider.dart';
import 'package:mobile/test_screen.dart';

void main() {
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(routerConfig: router);
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int selectedIdx = 0;

  final screens = const [
    Text('Movies'),
    Text('Showtimes'),
    Text('My Reservations'),
    TestScreen(),
  ];
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Image.asset('assets/logo_movie_system.png', width: 60, height: 40),
            const SizedBox(width: 10),
            const Text('CINEMA'),
          ],
        ),
        backgroundColor: Colors.white,
      ),

      body: screens[selectedIdx],
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIdx,

        onDestinationSelected: (index) {
          setState(() {
            selectedIdx = index;
          });
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.movie), label: 'Movies'),
          NavigationDestination(
            icon: Icon(Icons.local_activity_sharp),
            label: 'Showtimes',
          ),
          NavigationDestination(
            icon: Icon(Icons.confirmation_number_rounded),
            label: 'Reservations',
          ),
          NavigationDestination(icon: Icon(Icons.bug_report), label: 'Test'),
        ],
      ),
    );
  }
}
