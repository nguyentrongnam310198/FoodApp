import React, {  useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity,
  Pressable
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { NavigationProp, useNavigation, useIsFocused } from '@react-navigation/native';
import RootStackParamList from '../../types/route';
import { useAppContext } from '../../context-api/app.context';
import { useTheme } from '../../reusable-components/theme/themeContext';

//----------------------------------------------------------------------------------------------------------

const HomeScreen = () => {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { contacts, setContacts, isFavorite, favorites } = useAppContext();  // Lấy contacts và favorites từ context
    const { theme, toggleTheme, colors } = useTheme();

    //***Fetch danh sách users từ API và merge với context
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);  // Flag để track đã fetch chưa
    const isFocused = useIsFocused();

    // Fetch API lần đầu - load vào context (CHỈ 1 LẦN DUY NHẤT)
    useEffect(() => {
        const fetchUsers = async () => {
            // Chỉ fetch nếu chưa fetch và contacts rỗng
            if (hasFetched || contacts.length > 0) {
                // console.log('[Home] Skip fetch - already have data');
                return;
            }

            try {
                // console.log('[Home] Fetching users from API...');
                const response = await axios.get('https://jsonplaceholder.typicode.com/users', { timeout: 5000 });
                let apiUsersData = Array.isArray(response?.data) ? response.data : [];
                // console.log('[Home] API users:', apiUsersData);
                setContacts(apiUsersData);
                setHasFetched(true);  // Đánh dấu đã fetch
                setError(null);
            } catch (err: any) {
                // console.log('[Home] API error:', err);
                setError(err.message || 'Lỗi khi tải dữ liệu');
            }
        };
        fetchUsers();
    }, []);  

    // Reload danh sách khi quay lại màn hình home (sử dụng isFocused)
    useEffect(() => {
        if (isFocused) {
            console.log('[Home] Screen focused - contacts:', contacts.length);
            // Contacts tự động cập nhật từ context, không cần làm gì thêm
        }
    }, [isFocused, contacts.length]);

    // Sử dụng contacts từ context trực tiếp
    const users = contacts;

    //***Xử lý search
    const [keyword, setKeyword] = useState('');

    //*Lọc users theo `keyword` (tên) - case insensitive
    const filteredUsers = useMemo(() => {
        const q = keyword.trim().toLowerCase();
        if (!q) {
            console.log('[Home] Render filteredUsers:', users);
            return users;
        }
        const filtered = users.filter(u => (u.name || '').toLowerCase().includes(q));
        console.log('[Home] Render filteredUsers (search):', filtered);
        return filtered;
    }, [users, keyword]);
    //useMemo: chỉ render lại khi 'users' hoặc 'keyword' thay đổi

//----------------------------------------------------------------------------------------------------------

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

        {/* Header */}
        <View style={styles.header}>
            <Text style={[styles.logo, { color: colors.primary }]}>LIÊN HỆ</Text>
            <View style={styles.headerIcons}>
                <Pressable onPress={() => toggleTheme()} style={styles.themeToggle}>
                    <Ionicons name={theme === 'light' ? 'sunny' : 'sunny-outline'} size={30} color={colors.subText} />
                </Pressable>
                <Pressable onPress={() => navigation.navigate('addcontact')}>
                    <Ionicons name="person-add-outline" size={30} color={colors.subText} style={styles.headerIcon} />
                </Pressable>
            </View>
        </View>

        {/* Search */}
        <View style={[styles.searchWrapper, { backgroundColor: colors.inputBackground }]}> 
            <Ionicons name="search" size={20} color={colors.subText} />
            <TextInput 
                style={[styles.input, { color: colors.text }]} 
                placeholder="Tìm kiếm" 
                placeholderTextColor={colors.placeholder}
                value={keyword}
                onChangeText={setKeyword}
            />
            <Pressable onPress={() => { if (keyword) setKeyword(''); }}>
                <Ionicons name={keyword ? 'backspace-outline' : 'close-outline'} size={20} color={colors.subText} />
            </Pressable>
        </View>


        {/* List */}
        <View style={styles.dealHeader}>
            <TouchableOpacity>
                {/* <Text 
                style={styles.exploreMore}
                onPress={() => navigation.navigate('addcontact')}
                >THÊM</Text> */}
            </TouchableOpacity>
        </View>

                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : filteredUsers.length === 0 ? (
                    <Text style={styles.noContacts}>Không có liên hệ nào</Text>
                ) : (
                    <>
                        {/* Debug: show user count */}
                        <Text style={[styles.totalCount, { color: colors.subText }]}>Tổng số: {filteredUsers.length}</Text>
                        <FlatList
                            data={filteredUsers}
                            extraData={favorites}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={item => String(item.id)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.userItem, { borderColor: colors.border, backgroundColor: colors.card }]}
                                    onPress={() => navigation.navigate('detail', { user: item })}
                                >
                                    <View style={styles.userRow}>
                                        <View style={styles.userInfo}>
                                            <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
                                            <Text style={[styles.userEmail, { color: colors.subText }]}>{item.email}</Text>
                                        </View>
                                        {isFavorite(item.id) && (
                                            <Ionicons name="star" size={20} color="#FFD700" style={styles.favoriteIcon} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </>
                )}

    </View>
  );
};

const styles = StyleSheet.create({
  
    container: { 
    flex: 1, 
    paddingTop: 60
    },

header: { 
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16 
    },

    logo: { 
    fontSize: 24, 
    fontWeight: 'bold'
    },

headerIcons: { 
    flexDirection: 'row'
    },

themeToggle: {
    marginRight: 12
},

headerIcon: { 
    marginLeft: 16
    },

searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, margin: 16, paddingHorizontal: 12, height: 44,
    },

input: { 
    flex: 1, 
    marginLeft: 8, 
    fontSize: 16 
    },

dealHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginHorizontal: 16, 
    marginTop: 8
    },

dealTitle: { 
    fontWeight: 'bold', 
    fontSize: 16 
    },

exploreMore: { 
    color: '#1877F2', 
    fontWeight: 'bold'
    },

dealImage: { 
    width: 120, 
    height: 80, 
    borderRadius: 12, 
    margin: 8
    },
    userItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1
    },

userRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

userInfo: {
        flex: 1
    },

    userName: {
        fontSize: 16,
        fontWeight: '600'
    },

    userEmail: {
        fontSize: 13,
        marginTop: 4
    },

    favoriteIcon: {
        marginLeft: 8
    },

noContacts: {
        margin: 16,
        color: '#888'
    },

errorText: {
        margin: 16,
        color: 'red'
    },

    bottomTab: {
    flexDirection: 'row', 
    justifyContent: 'space-around',  //chia đều khoảng cách giữa các icon
    alignItems: 'center',  //căn giữa theo chiều dọc
    height: 56,  
    borderTopWidth: 1,
    marginTop: 8,
    },

    totalCount: {
        marginLeft: 16,
        fontSize: 15
    }
});

export default HomeScreen;

// Hook	                Khi nào dùng
// useIsFocused	        Chỉ cần biết trạng thái focus (true/false)
// useFocusEffect   	Cần cleanup khi rời màn