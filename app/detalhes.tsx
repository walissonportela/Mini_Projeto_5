import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

type Atividade = {
  id: number;
  nomeAtividade: string;
  responsavel: string;
  data: string;
  descricao: string;
  participantes: { nome: string; email: string }[];
};

export default function DetalhesAtividade() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("✅ ID recebido em detalhes:", id); // Debug do ID recebido
  
    const carregarDetalhes = async () => {
      try {
        const atividadesSalvas = await AsyncStorage.getItem('atividades');
        console.log("📂 Atividades no AsyncStorage:", atividadesSalvas); // 🔥 Verificar se os dados existem
  
        if (atividadesSalvas) {
          const listaAtividades: Atividade[] = JSON.parse(atividadesSalvas);
          console.log("📌 Lista de Atividades:", listaAtividades); // Debug para ver se os dados estão corretos
  
          const atividadeEncontrada = listaAtividades.find((a) => String(a.id) === String(id));
          console.log("🔎 Atividade encontrada:", atividadeEncontrada); // Ver se encontrou algo
  
          if (atividadeEncontrada) {
            setAtividade(atividadeEncontrada);
          } else {
            console.warn("⚠️ Nenhuma atividade foi encontrada com esse ID!");
          }
        }
      } catch (error) {
        console.error("❌ Erro ao carregar detalhes", error);
      } finally {
        setLoading(false);
      }
    };
  
    if (id) {
      carregarDetalhes();
    } else {
      console.error("❌ Nenhum ID recebido!");
      setLoading(false);
    }
  }, [id]);  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0086de" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!atividade) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Atividade não encontrada.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/lista')}>
          <Icon name="arrow-left" size={20} color="#fff" />
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{atividade.nomeAtividade}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}><Icon name="user" size={16} /> Responsável: {atividade.responsavel}</Text>
        <Text style={styles.label}><Icon name="calendar" size={16} /> Data: {atividade.data}</Text>
        <Text style={styles.label}><Icon name="info-circle" size={16} /> Descrição:</Text>
        <Text style={styles.description}>{atividade.descricao}</Text>

        <Text style={styles.subtitle}><Icon name="users" size={16} /> Participantes:</Text>
        {atividade.participantes.length > 0 ? (
          atividade.participantes.map((participante, index) => (
            <Text key={index} style={styles.participante}>
              - {participante.nome} ({participante.email})
            </Text>
          ))
        ) : (
          <Text style={styles.participanteVazio}>Nenhum participante</Text>
        )}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/lista')}>
        <Icon name="arrow-left" size={20} color="#fff" />
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f4f4', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
  infoBox: { backgroundColor: '#fff', padding: 15, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  label: { fontSize: 16, marginBottom: 8, fontWeight: 'bold' },
  description: { fontSize: 16, color: '#555', marginBottom: 10, fontStyle: 'italic' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, color: '#333' },
  participante: { fontSize: 16, color: '#444' },
  participanteVazio: { fontSize: 16, color: '#999', fontStyle: 'italic' },
  backButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0086de', padding: 12, borderRadius: 8, marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, marginLeft: 8, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f4f4' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
});
