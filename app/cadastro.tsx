// cadastro.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

export default function CadastroScreen() {
  const [nomeAtividade, setNomeAtividade] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [data, setData] = useState('');
  const [descricao, setDescricao] = useState('');
  const [participantes, setParticipantes] = useState([{ nome: '', email: '' }]);

  const adicionarParticipante = () => {
    setParticipantes([...participantes, { nome: '', email: '' }]);
  };

const removerParticipante = (index: number) => {
  setParticipantes(participantes.filter((_, i) => i !== index));
};


  const router = useRouter();

  const salvarAtividade = async () => {
    if (!nomeAtividade || !responsavel || !data || !descricao) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios!');
      return;
    }

    if (participantes.some(p => !p.nome || !p.email)) {
      Alert.alert('Erro', 'Preencha todos os campos dos participantes!');
      return;
    }

    try {
      const novaAtividade = {
        id: Date.now(),
        nomeAtividade,
        responsavel,
        data,
        descricao,
        participantes,
      };

      const atividadesSalvas = await AsyncStorage.getItem('atividades');
      const atividades = atividadesSalvas ? JSON.parse(atividadesSalvas) : [];
      atividades.push(novaAtividade);
      await AsyncStorage.setItem('atividades', JSON.stringify(atividades));

      Alert.alert('Sucesso', 'Atividade cadastrada com sucesso!');
      setTimeout(() => router.replace('/lista'), 1000);

      setNomeAtividade('');
      setResponsavel('');
      setData('');
      setDescricao('');
      setParticipantes([{ nome: '', email: '' }]);
    } catch (error) {
      console.error('Erro ao salvar atividade', error);
      Alert.alert('Erro', 'Não foi possível salvar a atividade.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastrar Nova Atividade</Text>

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
          {participantes.length > 1 && (
            <TouchableOpacity style={styles.removeButton} onPress={() => removerParticipante(index)}>
              <Text style={styles.removeButtonText}>REMOVER</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={adicionarParticipante}>
          <Icon name="user-plus" size={20} color="#fff" />
          <Text style={styles.buttonText}>Adicionar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={salvarAtividade}>
          <Icon name="save" size={20} color="#fff" />
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f4f4f4' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 5, marginBottom: 10 },
  descricao: { height: 80, textAlignVertical: 'top' },
  participanteContainer: { marginBottom: 10, backgroundColor: '#f4f4f4', padding: 10, borderRadius: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0086de', padding: 10, borderRadius: 5, flex: 1, justifyContent: 'center', marginHorizontal: 5 },
  saveButton: { backgroundColor: 'green' },
  buttonText: { color: '#fff', fontSize: 16, marginLeft: 8, fontWeight: 'bold' },
  removeButton: { backgroundColor: 'red', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 5, alignSelf: 'flex-start', marginTop: 5 },
  removeButtonText: { color: '#fff', fontWeight: 'bold' },
});