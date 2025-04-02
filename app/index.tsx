import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

const setupDatabase = async () => {
  db = await SQLite.openDatabaseAsync('items.db');
  await db.execAsync('CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);');
};

export default function App() {
  const [text, setText] = useState('');
  const [items, setItems] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    setupDatabase().then(fetchItems);
  }, []);

  const fetchItems = async () => {
    if (!db) return;
    const results = await db.getAllAsync<{ id: number; name: string }>('SELECT id, name FROM items;');
    setItems(results.map(row => ({ id: row.id, name: row.name })));
  };

  const addItem = async () => {
    if (db === null || text === '') return;
    await db.runAsync('INSERT INTO items (name) VALUES (?);', [text]);
    setText('');
    fetchItems();
  };

  const deleteItem = async (id: number) => {
    if (db === null) return;
    await db.runAsync('DELETE FROM items WHERE id = ?;', [id]);
    fetchItems();
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Enter item"
        value={text}
        onChangeText={setText}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button title="Add Item" onPress={addItem} />
      <FlatList
        data={items}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
            <Text>{item.name}</Text>
            <TouchableOpacity onPress={() => deleteItem(item.id)}>
              <Text style={{ color: 'red' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
