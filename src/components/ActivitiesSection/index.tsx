import { useEffect, useState } from 'react';
import { useActivities, useStays, useCustomizedTrainings } from '../../lib/hooks/useSupabaseData';
import { FiMapPin, FiClock, FiUsers } from 'react-icons/fi';
import {
  SectionContainer,
  SectionHeader,
  Title,
  Subtitle,
  CardsContainer,
  Card,
  CardImage,
  CardContent,
  CardCategory,
  CardTitle,
  CardDescription,
  CardFooter,
  CardLocation,
  CardPrice,
} from './styles';

interface ExperienceCard {
  id: number | string;
  type: "activity" | "stay" | "training";
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  location?: string;
  price: string;
  duration?: string;
  maxParticipants?: number;
}

const ActivitiesSection = () => {
  const { activities, loading: activitiesLoading } = useActivities();
  const { stays, loading: staysLoading } = useStays();
  const { trainings, loading: trainingsLoading } = useCustomizedTrainings();
  const [selectedCards, setSelectedCards] = useState<ExperienceCard[]>([]);

  useEffect(() => {
    if (!activitiesLoading && !staysLoading && !trainingsLoading) {
      const allCards: ExperienceCard[] = [
        ...activities.map((activity): ExperienceCard => ({
          id: activity.id,
          type: "activity",
          title: activity.name,
          description: activity.description,
          imageUrl: activity.main_image,
          category: activity.activity_type || "Activity",
          location: "Multiple Locations",
          price: "Contact for price"
        })),
        ...stays.map((stay): ExperienceCard => ({
          id: stay.id,
          type: "stay",
          title: stay.title || 'Default Title',
          description: stay.description || "",
          imageUrl: stay.image_url || "",
          category: "Stay",
          location: stay.location,
          price: `$${stay.price_per_night}/night`
        })),
        ...trainings.map((training): ExperienceCard => ({
          id: training.id,
          type: "training",
          title: training.title,
          description: training.description || "",
          imageUrl: training.image_url || "",
          category: training.category || "Training",
          location: "Multiple Locations",
          price: "Custom Quote",
          duration: training.duration,
          maxParticipants: training.max_participants
        }))
      ];

      // Randomly select 3 cards
      const shuffled = allCards.sort(() => 0.5 - Math.random());
      setSelectedCards(shuffled.slice(0, 3));
    }
  }, [activities, stays, trainings, activitiesLoading, staysLoading, trainingsLoading]);

  if (activitiesLoading || staysLoading || trainingsLoading) {
    return <div>Loading...</div>;
  }

  const getCardFooter = (card: ExperienceCard) => {
    switch (card.type) {
      case 'activity':
        return (
          <>
            <CardLocation><FiMapPin /> {card.location}</CardLocation>
            <CardPrice>{card.price}</CardPrice>
          </>
        );
      case 'stay':
        return (
          <>
            <CardLocation><FiMapPin /> {card.location}</CardLocation>
            <CardPrice>{card.price}</CardPrice>
          </>
        );
      case 'training':
        return (
          <>
            <CardLocation><FiClock /> {card.duration}</CardLocation>
            <CardPrice><FiUsers /> Up to {card.maxParticipants} participants</CardPrice>
          </>
        );
    }
  };

  return (
    <SectionContainer>
      <SectionHeader>
        <Title>Embark on Extraordinary Experiences</Title>
        <Subtitle>
          From thrilling activities to serene stays and transformative training programs,
          discover experiences that will elevate your team's spirit and create lasting memories.
        </Subtitle>
      </SectionHeader>

      <CardsContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {selectedCards.map((card) => (
          <Card
            key={`${card.type}-${card.id}`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <CardImage imageUrl={card.imageUrl} />
            <CardContent>
              <CardCategory>{card.category}</CardCategory>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
              <CardFooter>
                {getCardFooter(card)}
              </CardFooter>
            </CardContent>
          </Card>
        ))}
      </CardsContainer>
    </SectionContainer>
  );
};

export default ActivitiesSection; 