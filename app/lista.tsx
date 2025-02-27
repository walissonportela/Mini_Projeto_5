// Tela para Listar as Atividades
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

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

  const apagarAtividade = async (id: number) => {
    try {
      const atividadesSalvas = await AsyncStorage.getItem('atividades');
      if (atividadesSalvas) {
        const atividades = JSON.parse(atividadesSalvas);
        const atividadesAtualizadas = atividades.filter((a: Atividade) => a.id !== id);
        await AsyncStorage.setItem('atividades', JSON.stringify(atividadesAtualizadas));
        setAtividades(atividadesAtualizadas);
        Alert.alert("Sucesso", "Atividade removida!");
      }
    } catch (error) {
      console.error("❌ Erro ao remover atividade", error);
    }
  };

  const salvarEdicao = async (atividadeEditada: Atividade) => {
    try {
      const atividadesSalvas = await AsyncStorage.getItem('atividades');
      let atividades = atividadesSalvas ? JSON.parse(atividadesSalvas) : [];

      atividades = atividades.map((a: Atividade) => (a.id === atividadeEditada.id ? atividadeEditada : a));

      await AsyncStorage.setItem('atividades', JSON.stringify(atividades));
      setAtividades(atividades);
      Alert.alert('Sucesso', 'Atividade atualizada com sucesso!');
      setEditingId(null);
    } catch (error) {
      console.error('Erro ao salvar edição', error);
    }
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
              {/* Botão para expandir detalhes */}
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setExpanded(expanded === item.id ? null : item.id)}
              >
                <MaterialIcons name={expanded === item.id ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
              </TouchableOpacity>

              {/* Mostra as informações básicas sempre */}
              <TouchableOpacity style={styles.itemDetails}>
                <Text style={styles.nome}>{item.nomeAtividade}</Text>
                <Text>Responsável: {item.responsavel}</Text>
                <Text>Data: {item.data}</Text>
              </TouchableOpacity>

              {/* Se estiver expandido, mostra detalhes */}
              {expanded === item.id && (
                <View style={styles.expandedContainer}>
                  {editingId === item.id ? (
                    <>
                      <TextInput
                        style={styles.input}
                        value={item.nomeAtividade}
                        onChangeText={(text) => {
                          setAtividades(prev => prev.map(a => a.id === item.id ? { ...a, nomeAtividade: text } : a));
                        }}
                      />
                      <TextInput
                        style={styles.input}
                        value={item.responsavel}
                        onChangeText={(text) => {
                          setAtividades(prev => prev.map(a => a.id === item.id ? { ...a, responsavel: text } : a));
                        }}
                      />
                      <TextInput
                        style={styles.input}
                        value={item.data}
                        onChangeText={(text) => {
                          setAtividades(prev => prev.map(a => a.id === item.id ? { ...a, data: text } : a));
                        }}
                      />
                      <TextInput
                        style={[styles.input, styles.descricao]}
                        value={item.descricao}
                        onChangeText={(text) => {
                          setAtividades(prev => prev.map(a => a.id === item.id ? { ...a, descricao: text } : a));
                        }}
                        multiline
                      />

                      <Text style={styles.subtitle}>Participantes:</Text>
                      {item.participantes.map((participante, index) => (
                        <View key={index} style={styles.participanteContainer}>
                          <TextInput
                            style={styles.input}
                            value={participante.nome}
                            onChangeText={(text) => {
                              setAtividades(prev => prev.map(a =>
                                a.id === item.id ? {
                                  ...a,
                                  participantes: a.participantes.map((p, i) =>
                                    i === index ? { ...p, nome: text } : p
                                  )
                                } : a
                              ));
                            }}
                          />
                          <TextInput
                            style={styles.input}
                            value={participante.email}
                            onChangeText={(text) => {
                              setAtividades(prev => prev.map(a =>
                                a.id === item.id ? {
                                  ...a,
                                  participantes: a.participantes.map((p, i) =>
                                    i === index ? { ...p, email: text } : p
                                  )
                                } : a
                              ));
                            }}
                          />
                        </View>
                      ))}
                    </>
                  ) : (
                    <>
                      <Text style={styles.descricao}>Descrição: {item.descricao}</Text>
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
                    </>
                  )}
                </View>
              )}

              {/* Botões de ação */}
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => setEditingId(editingId === item.id ? null : item.id)}>
                  <MaterialIcons name="edit" size={24} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => apagarAtividade(item.id)}>
                  <MaterialIcons name="delete" size={24} color="red" />
                </TouchableOpacity>
                {editingId === item.id && (
                  <TouchableOpacity onPress={() => salvarEdicao(item)}>
                    <MaterialIcons name="save" size={24} color="green" />
                  </TouchableOpacity>
                )}
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
    padding: 15,
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  itemDetails: { flex: 1 },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 5 },
  descricao: { fontSize: 14, color: '#666', marginBottom: 10 },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10, color: '#444' },
  participante: { fontSize: 14, color: '#444' },
  participanteVazio: { fontSize: 14, color: '#999', fontStyle: 'italic' },
  expandedContainer: { marginTop: 10, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5 },
  participanteContainer: { 
    flexDirection: 'column', 
    backgroundColor: '#f0f0f0', 
    padding: 10, 
    borderRadius: 5, 
    marginBottom: 5 
  },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 5, marginBottom: 5, borderWidth: 1, borderColor: '#ddd' },
  itemActions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  expandButton: {
    alignSelf: 'flex-end',
    marginBottom: 5,
  },
});
