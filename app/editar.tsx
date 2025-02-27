import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';

type Atividade = {
  id: number;
  nomeAtividade: string;
  responsavel: string;
  data: string;
  descricao: string;
  participantes: { nome: string; email: string }[];
};

export default function EditarScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [atividade, setAtividade] = useState<Atividade | null>(null);

  const [nomeAtividade, setNomeAtividade] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [data, setData] = useState('');
  const [descricao, setDescricao] = useState('');
  const [participantes, setParticipantes] = useState([{ nome: '', email: '' }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarAtividade = async () => {
      try {
        const atividadesSalvas = await AsyncStorage.getItem('atividades');
        if (atividadesSalvas) {
          const atividades: Atividade[] = JSON.parse(atividadesSalvas);
          const atividadeEncontrada = atividades.find(a => a.id.toString() === id);
          if (atividadeEncontrada) {
            setAtividade(atividadeEncontrada);
            setNomeAtividade(atividadeEncontrada.nomeAtividade);
            setResponsavel(atividadeEncontrada.responsavel);
            setData(atividadeEncontrada.data);
            setDescricao(atividadeEncontrada.descricao);
            setParticipantes(atividadeEncontrada.participantes);
          } else {
            Alert.alert('Erro', 'Atividade não encontrada.');
            router.back();
          }
        }
      } catch (error) {
        console.error('Erro ao carregar atividade', error);
      } finally {
        setLoading(false);
      }
    };

    carregarAtividade();
  }, [id]);

  const salvarEdicao = async () => {
    if (!nomeAtividade || !responsavel || !data || !descricao) { 
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
      return;
    }  
    if (participantes.some(p => !p.nome || !p.email)) {
      Alert.alert('Erro', 'Preencha todos os campos dos participantes!');
      return;
    }

    try {
      const atividadesSalvas = await AsyncStorage.getItem('atividades');
      let atividades: Atividade[] = atividadesSalvas ? JSON.parse(atividadesSalvas) : [];

      atividades = atividades.map(a => {
        if (a.id.toString() === id) {
          return {
            ...a,
            nomeAtividade,
            responsavel,
            data,
            descricao,
            participantes,
          };
        }
        return a;
      });

      await AsyncStorage.setItem('atividades', JSON.stringify(atividades));
      Alert.alert('Sucesso', 'Atividade atualizada com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/lista') }
      ]);
    } catch (error) {
      console.error('Erro ao atualizar atividade', error);
      Alert.alert('Erro', 'Não foi possível atualizar a atividade.');
    }
  };

  const cancelarEdicao = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0086de" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Atividade</Text>

      <TextInput style={styles.input} placeholder="Nome da Atividade" value={nomeAtividade} onChangeText={setNomeAtividade} />
      <TextInput style={styles.input} placeholder="Responsável" value={responsavel} onChangeText={setResponsavel} />
      <TextInput style={styles.input} placeholder="Data" value={data} onChangeText={setData} />
      <TextInput style={[styles.input, styles.descricao]} placeholder="Descrição" value={descricao} onChangeText={setDescricao} multiline />

      <Text style={styles.subtitle}>Participantes</Text>
      
      {participantes.map((participante, index) => (
        <View key={index} style={styles.participanteContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="Nome do Participante" 
            value={participante.nome} 
            onChangeText={(text) => {
              const novosParticipantes = [...participantes];
              novosParticipantes[index].nome = text;
              setParticipantes(novosParticipantes);
            }} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="E-mail do Participante" 
            keyboardType="email-address"
            value={participante.email} 
            onChangeText={(text) => {
              const novosParticipantes = [...participantes];
              novosParticipantes[index].email = text;
              setParticipantes(novosParticipantes);
            }} 
          />
        </View>
      ))}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={salvarEdicao}>
          <Icon name="save" size={20} color="#fff" />
          <Text style={styles.buttonText}>Salvar Alterações</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={cancelarEdicao}>
          <Icon name="close" size={20} color="#fff" />
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f4f4f4' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  descricao: { height: 80, textAlignVertical: 'top' },
  participanteContainer: { marginBottom: 10, backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  button: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0086de', padding: 12, borderRadius: 8,
    flex: 1, justifyContent: 'center', marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: '#888' },
  buttonText: { color: '#fff', fontSize: 16, marginLeft: 8, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f4f4' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
});

