// lista.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

type Atividade = {
  id: number;
  nomeAtividade: string;
  responsavel: string;
  data: string;
  descricao: string;
  participantes: { nome: string; email: string }[];
};

export default function ListaScreen() {
  const router = useRouter();
  const [atividades, setAtividades] = useState<Atividade[]>([]);

  useFocusEffect(
    useCallback(() => {
      const carregarAtividades = async () => {
        try {
          const atividadesSalvas = await AsyncStorage.getItem('atividades');
          if (atividadesSalvas) {
            setAtividades(JSON.parse(atividadesSalvas));
          }
        } catch (error) {
          console.error("Erro ao carregar atividades", error);
        }
      };
      carregarAtividades();
    }, [])
  );

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja excluir essa atividade?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // 🔥 Filtra as atividades removendo o item deletado
              const updatedAtividades = atividades.filter(atividade => atividade.id !== id);
  
              // 🔥 Atualiza o AsyncStorage
              await AsyncStorage.setItem('atividades', JSON.stringify(updatedAtividades));
  
              // 🔥 Atualiza o estado para refletir a exclusão
              setAtividades([...updatedAtividades]);
  
              Alert.alert('Sucesso', 'Atividade excluída com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir atividade', error);
              Alert.alert('Erro', 'Não foi possível excluir a atividade.');
            }
          }
        }
      ]
    );
  };

  const handleEdit = (id: number) => {
    console.log("Editando atividade com ID:", id);
    router.push({
      pathname: "/editar",
      params: { id: id.toString() }, // 🔥 Passando o ID corretamente
    });
  };
  
  const handleDetails = (id: number) => {
    console.log("🔍 Visualizando detalhes da atividade com ID:", id);
    router.push({
      pathname: "/detalhes",
      params: { id: id.toString() }, // 🔥 Passando o ID corretamente
    });
  };
  
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atividades Cadastradas</Text>
      {atividades.length === 0 ? (
        <Text style={styles.empty}>Nenhuma atividade cadastrada.</Text>
      ) : (
        <FlatList
          data={atividades}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <TouchableOpacity
                style={styles.itemDetails}
                onPress={() => handleDetails(item.id)}
              >
                <Text style={styles.nome}>{item.nomeAtividade}</Text>
                <Text style={styles.descricao}>Descrição: {item.descricao}</Text>
                <Text>Responsável: {item.responsavel}</Text>
                <Text>Data: {item.data}</Text>
                <Text style={styles.subtitle}>Participantes:</Text>
                {item.participantes.length > 0 ? (
                  item.participantes.map((participante, index) => (
                    <Text key={index} style={styles.participante}>
                      - {participante.nome} ({participante.email})
                    </Text>
                  ))
                ) : (
                  <Text style={styles.participanteVazio}>Nenhum participante</Text>
                )}
              </TouchableOpacity>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => handleEdit(item.id)}>
                    <MaterialIcons name="edit" size={24} color="blue" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <MaterialIcons name="delete" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f4f4' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  empty: { textAlign: 'center', fontSize: 16, color: '#888' },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  itemDetails: { flex: 1 },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  descricao: { fontSize: 14, color: '#666', marginBottom: 5 },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  participante: { fontSize: 14, color: '#444' },
  participanteVazio: { fontSize: 14, color: '#999', fontStyle: 'italic' },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 60,
  },
});