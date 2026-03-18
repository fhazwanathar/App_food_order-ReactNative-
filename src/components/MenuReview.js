import { useEffect, useState } from 'react';
import { Button, FlatList, Text, TextInput, View } from 'react-native';
import { addReview, getMenuReviews } from '../features/reviews';

export default function MenuReview({ menu_item_id, user_id, user_name }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [reviews, setReviews] = useState([]);

  // Fetch reviews when menu changes
  useEffect(() => {
    async function fetchReviews() {
      const { data, error } = await getMenuReviews(menu_item_id);
      if (!error) setReviews(data);
    }
    fetchReviews();
  }, [menu_item_id]);
  const handleSubmit = async () => {
  console.log({
    menu_item_id, user_id, rating, text, user_name
  }); // Log semua input sebelum insert
  if (rating < 1 || rating > 5) return alert('Rating harus 1-5');
  const { data, error } = await addReview(menu_item_id, user_id, rating, text, user_name);
  if (error) return; // Error sudah muncul log dan alert dari addReview
  // dst...
};

  return (
    <View style={{ margin: 16 }}>
      <Text>Berikan Rating & Komentar:</Text>
      <Text>Rating (1-5):</Text>
      <TextInput
        value={String(rating)}
        keyboardType="numeric"
        onChangeText={v => setRating(Number(v))}
        style={{ borderWidth: 1, marginVertical: 4 }}
      />
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Tulis komentar..."
        style={{ borderWidth: 1, marginVertical: 4 }}
      />
      <Button title="Kirim Review" onPress={handleSubmit} />
      <Text style={{ marginTop: 12, fontWeight: 'bold' }}>Daftar Review:</Text>
      <FlatList
        data={reviews}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ borderBottomWidth: 1, marginVertical: 4 }}>
            <Text>{item.user_name || 'User'} | Rating: {item.rating}</Text>
            <Text>{item.text}</Text>
          </View>
        )}
      />
    </View>
  );
}