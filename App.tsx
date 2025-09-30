import React, { useState, useRef, RefObject } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Text,
  ImageBackground,
  Image,
  ScrollView,
  Platform,
  StatusBar,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { AppFonts, AppImages } from './AppImages';
import Lucide from '@react-native-vector-icons/lucide';

const { width, height } = Dimensions.get('window');
const CARD_SIZE = (width - 60) / 2;
const CARD_HEIGHT = CARD_SIZE * 1.4;

const getSafeTop = (): number => {
  if (Platform.OS === 'android') {
    const safeTop = StatusBar.currentHeight ? StatusBar.currentHeight : 0;
    return Math.min(safeTop, 24);
  }
  if (height >= 812) return 44;
  return 20;
};

const HEADER_HEIGHT = 65 + getSafeTop();

const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);

type CardType = {
  id: string;
  image: any;
  flippedImage: any;
};

type CardLayout = {
  x: number;
  y: number;
  w: number;
  h: number;
} | null;

type CardRefs = {
  [key: string]: View | null;
};

const App: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const positionX = useRef(new Animated.Value(0)).current;
  const positionY = useRef(new Animated.Value(0)).current;
  const cardsOpacity = useRef(new Animated.Value(1)).current;
  const cardToTopAnim = useRef(new Animated.Value(0)).current;
  const detailsOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const [cardLayout, setCardLayout] = useState<CardLayout>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showFinalCard, setShowFinalCard] = useState<boolean>(false);

  const bgOpacity = useRef(new Animated.Value(0)).current;

  const cards: CardType[] = [
    { id: '1', image: AppImages.cardone, flippedImage: AppImages.selectedcard },
    { id: '2', image: AppImages.cardtwo, flippedImage: AppImages.selectedcard },
    {
      id: '3',
      image: AppImages.cardthree,
      flippedImage: AppImages.selectedcard,
    },
    {
      id: '4',
      image: AppImages.cardfour,
      flippedImage: AppImages.selectedcard,
    },
  ];

  const resetAnimations = (): void => {
    flipAnim.setValue(0);
    scaleAnim.setValue(1);
    positionX.setValue(0);
    positionY.setValue(0);
    cardsOpacity.setValue(1);
    cardToTopAnim.setValue(0);
    detailsOpacity.setValue(0);
    headerOpacity.setValue(0);
    bgOpacity.setValue(0);
    setSelectedCard(null);
    setCardLayout(null);
    setShowDetails(false);
    setShowFinalCard(false);
  };

  const cardRefs = useRef<CardRefs>({});

  const handleCardPress = (card: CardType, cardId: string): void => {
    const cardRef = cardRefs.current[cardId];
    if (
      cardRef &&
      'measure' in cardRef &&
      typeof cardRef.measure === 'function'
    ) {
      (cardRef as any).measure(
        (
          x: number,
          y: number,
          w: number,
          h: number,
          pageX: number,
          pageY: number,
        ) => {
          setCardLayout({ x: pageX, y: pageY, w, h });
          setSelectedCard(card);
          setShowFinalCard(false);

          const centerX = width / 2 - w / 2;
          const centerY = height / 2 - h / 2;
          const translateX = centerX - pageX;
          const translateY = centerY - pageY;

          Animated.parallel([
            Animated.timing(flipAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(flipAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(flipAnim, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setShowFinalCard(true);

            Animated.sequence([
              Animated.parallel([
                Animated.timing(cardsOpacity, {
                  toValue: 0,
                  duration: 400,
                  useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                  toValue: 1.8,
                  duration: 800,
                  useNativeDriver: true,
                }),
                Animated.timing(positionX, {
                  toValue: translateX,
                  duration: 800,
                  useNativeDriver: true,
                }),
                Animated.timing(positionY, {
                  toValue: translateY,
                  duration: 800,
                  useNativeDriver: true,
                }),
                Animated.timing(bgOpacity, {
                  toValue: 1,
                  duration: 800,
                  useNativeDriver: true,
                }),
              ]),
              Animated.parallel([
                Animated.timing(cardToTopAnim, {
                  toValue: 1,
                  duration: 800,
                  useNativeDriver: true,
                }),
                Animated.timing(headerOpacity, {
                  toValue: 1,
                  duration: 800,
                  useNativeDriver: true,
                }),
              ]),
            ]).start(() => {
              setShowDetails(true);

              setTimeout(() => {
                Animated.timing(detailsOpacity, {
                  toValue: 1,
                  duration: 800,
                  useNativeDriver: true,
                }).start();
              }, 50);
            });
          });
        },
      );
    }
  };

  const flipInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const cardTopPosition = cardToTopAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height / 2 + 320],
  });

  const renderCard = ({ item }: { item: CardType }) => (
    <View
      style={styles.card}
      ref={ref => {
        if (ref) cardRefs.current[item.id] = ref;
      }}
    >
      <TouchableOpacity
        onPress={() => handleCardPress(item, item.id)}
        activeOpacity={0.8}
        style={styles.cardTouchable}
      >
        <Image
          source={item.image}
          style={styles.cardImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );

  const getFinalCardLayout = (): (
    | ViewStyle
    | { width: number; height: number }
  )[] => {
    const cardWidth = cardLayout ? cardLayout.w : CARD_SIZE;
    const cardHeight = cardLayout ? cardLayout.h : CARD_HEIGHT;
    return [
      styles.finalCardLayout,
      { width: cardWidth * 1.8, height: cardHeight * 1.8 },
    ];
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={AppImages.backimage}
        style={StyleSheet.absoluteFill}
      />
      <AnimatedImageBackground
        source={AppImages.selectedcardback}
        style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}
        blurRadius={0}
      />

      {showDetails ? (
        <Animated.View
          style={[
            styles.header,
            { opacity: headerOpacity, paddingTop: getSafeTop() },
          ]}
        >
          <TouchableOpacity style={styles.backButton} onPress={resetAnimations}>
            <Lucide name="chevron-left" size={25} color={'white'} />
          </TouchableOpacity>
          <Text style={{ ...styles.headerTitle, left: -14 }} numberOfLines={1}>
            Starcrossed
          </Text>
          <Text></Text>
        </Animated.View>
      ) : (
        <Animated.View
          style={[
            styles.header,
            { justifyContent: 'center', paddingTop: getSafeTop() },
          ]}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            Starcrossed
          </Text>
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.cardGrid,
          { opacity: cardsOpacity, paddingTop: HEADER_HEIGHT },
        ]}
      >
        <View style={styles.cardGridHeader}>
          <Text
            style={{ ...styles.cardGridTitle, fontStyle: 'normal' }}
            numberOfLines={1}
          >
            Select <Text style={{ fontFamily: AppFonts.italic }}>your</Text>
            <Text> card</Text>
          </Text>
          <Text style={styles.cardGridSubtitle}>
            Choose a tarot card to discover its{`\n`}influence on your life this
            week.
          </Text>
        </View>
        <FlatList
          data={cards}
          renderItem={renderCard}
          keyExtractor={(item: CardType) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
        />
      </Animated.View>

      {selectedCard && cardLayout && !showDetails && (
        <Animated.View
          style={[
            styles.selectedCardContainer,
            {
              position: 'absolute',
              top: cardLayout.y,
              left: cardLayout.x,
              width: cardLayout.w,
              height: cardLayout.h,
              transform: [
                { perspective: 1000 },
                { translateX: positionX },
                { translateY: positionY },
                { translateY: cardTopPosition },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.cardFace,
              {
                transform: [{ rotateY: flipInterpolate }],
                backfaceVisibility: 'hidden',
              },
            ]}
          >
            <Image
              source={selectedCard.image}
              style={styles.selectedCardImage}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardBack,
              {
                transform: [
                  { rotateY: '180deg' },
                  { rotateY: flipInterpolate },
                ],
              },
            ]}
          >
            <Image
              source={
                showFinalCard ? selectedCard.flippedImage : selectedCard.image
              }
              style={styles.selectedCardImage}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>
      )}

      {showDetails && (
        <Animated.View
          style={[
            styles.detailsScrollWrapper,
            {
              position: 'absolute',
              left: 0,
              right: 0,
              top: HEADER_HEIGHT,
              bottom: 0,
              zIndex: 998,
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{ ...styles.scrollContent }}
            showsVerticalScrollIndicator={false}
          >
            {selectedCard && (
              <View style={getFinalCardLayout()}>
                <View style={styles.finalCardInner}>
                  <View style={styles.finalCardFace}>
                    <View style={styles.finalCardBack}>
                      <Text style={styles.finalCardChosenText}>
                        You've chosen
                      </Text>
                      <Image
                        source={selectedCard.flippedImage}
                        style={styles.finalCardImage}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
            <Image
              source={AppImages.carddetail}
              style={styles.cardDetailImage}
            />
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 15,
    backgroundColor: 'transparent',
    zIndex: 1001,
    borderBottomWidth: 1,
    borderBottomColor: '#A4A5A5',
  } as ViewStyle,
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 1,
  } as ViewStyle,
  headerTitle: {
    fontSize: 13,
    color: '#FFF',
    textTransform: 'uppercase',
    textAlign: 'center',
    fontFamily: AppFonts.regular,
  } as TextStyle,
  cardGrid: { flex: 1 } as ViewStyle,
  cardGridHeader: {
    marginTop: 15,
    alignSelf: 'center',
    alignItems: 'center',
  } as ViewStyle,
  cardGridTitle: {
    textAlign: 'center',
    color: 'white',
    fontSize: 25,
    textTransform: 'uppercase',
    fontStyle: 'italic',
  } as TextStyle,
  cardGridSubtitle: {
    textAlign: 'center',
    color: 'white',
    marginTop: 15,
    fontFamily: AppFonts.regular,
  } as TextStyle,
  listContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 20,
  } as ViewStyle,
  row: { justifyContent: 'space-between' } as ViewStyle,
  card: {
    width: CARD_SIZE,
    height: CARD_HEIGHT,
    marginBottom: 20,
  } as ViewStyle,
  cardTouchable: { width: '100%', height: '100%' } as ViewStyle,
  cardImage: { width: '100%', height: '100%', borderRadius: 16 } as ImageStyle,
  selectedCardContainer: { zIndex: 999 } as ViewStyle,
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  } as ViewStyle,
  cardBack: { backfaceVisibility: 'hidden' } as ViewStyle,
  selectedCardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  } as ImageStyle,
  detailsScrollWrapper: { backgroundColor: 'transparent' } as ViewStyle,
  scrollView: { flex: 1 } as ViewStyle,
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 20,
  } as ViewStyle,
  finalCardLayout: {
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  } as ViewStyle,
  finalCardInner: { flex: 1 } as ViewStyle,
  finalCardFace: {
    position: 'relative',
    width: '100%',
    height: '100%',
  } as ViewStyle,
  finalCardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  } as ViewStyle,
  finalCardChosenText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 0,
    textTransform: 'uppercase',
    marginBottom: 5,
    fontFamily: AppFonts.regular,
  } as TextStyle,
  finalCardImage: { width: '100%', height: '81%' } as ImageStyle,
  cardDetailImage: {
    width: '100%',
    height: Math.min(height * 0.7, 500),
    resizeMode: 'contain',
    marginTop: -85,
  } as ImageStyle,
});

export default App;
