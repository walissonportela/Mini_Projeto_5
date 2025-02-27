import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Importando as telas
import HomeScreen from './index';
import CadastroScreen from './cadastro';
import ListaScreen from './lista';

// 🔥 Agora usando [id].tsx dentro das pastas editar e detalhes
import EditarScreen from './editar';
import DetalhesScreen from './detalhes';

const Drawer = createDrawerNavigator();

export default function Layout() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0086de' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitle: () => (
          <Text style={styles.headerTitle}>UFC Sobral - Sistema de Atividades</Text>
        ),
      }}
    >
      <Drawer.Screen 
        name="index" 
        component={HomeScreen} 
        options={{ 
          title: 'Página Inicial',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="cadastro" 
        component={CadastroScreen} 
        options={{ 
          title: 'Cadastrar Atividade',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="playlist-add" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="lista" 
        component={ListaScreen} 
        options={{ 
          title: 'Ver Atividades',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="list" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="editar" 
        component={EditarScreen} 
        options={{ 
          title: 'Editar Atividade',
        }} 
      />
      <Drawer.Screen 
        name="detalhes" 
        component={DetalhesScreen} 
        options={{ 
          title: 'Detalhes da Atividade',
        }} 
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});
