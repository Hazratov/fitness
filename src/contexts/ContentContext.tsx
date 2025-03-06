
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

// Types for our data models
export interface ExerciseStep {
  id: string;
  name: string;
  duration: string;
  description: string;
  image_url?: string;
}

export interface ExerciseBlock {
  id: string;
  name: string;
  calories: number;
  water_intake: number;
  duration: number;
  description: string;
  video_url?: string;
  image_url?: string;
  steps: ExerciseStep[];
}

export interface MealPreparationStep {
  id: string;
  description: string;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  water_intake: number;
  preparation_time: number;
  description: string;
  image_url?: string;
  video_url?: string;
  steps: MealPreparationStep[];
}

interface ContentContextType {
  exerciseBlocks: ExerciseBlock[];
  meals: Meal[];
  fetchExerciseBlocks: () => Promise<void>;
  fetchMeals: () => Promise<void>;
  addExerciseBlock: (block: Omit<ExerciseBlock, "id">) => Promise<void>;
  updateExerciseBlock: (id: string, block: Partial<ExerciseBlock>) => Promise<void>;
  deleteExerciseBlock: (id: string) => Promise<void>;
  uploadExerciseBlockImage: (id: string, file: File) => Promise<void>;
  uploadExerciseStepImage: (blockId: string, stepId: string, file: File) => Promise<void>;
  addMeal: (meal: Omit<Meal, "id">) => Promise<void>;
  updateMeal: (id: string, meal: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  uploadMealImage: (id: string, file: File) => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exerciseBlocks, setExerciseBlocks] = useState<ExerciseBlock[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);

  // Mock data for initial development
  useEffect(() => {
    setExerciseBlocks([
      {
        id: "1",
        name: "Yurish mashqlari",
        calories: 150,
        water_intake: 500,
        duration: 30,
        description: "Yengil yurish yoki joggingni oqrgani uchun mashqlar",
        steps: [
          {
            id: "1",
            name: "Isitish",
            duration: "5 - 10 daqiqa",
            description: "Yengil yurish yoki joggingni oqrgani uchun mashqlar"
          },
          {
            id: "2",
            name: "Asosiy Mashq",
            duration: "5 - 10 daqiqa",
            description: "Qorin va belda yugurmasliq va orqa adela ishlatish kodingizni chiqaring"
          }
        ]
      }
    ]);
    
    setMeals([
      {
        id: "1",
        name: "Avokado va tuxumli buterbrod",
        calories: 1800,
        water_intake: 300,
        preparation_time: 20,
        description: "Bu yengil taomif tavsifi",
        steps: [
          {
            id: "1",
            description: "Tuxumlarni suvda qaynatring yoki pishiring qiling"
          },
          {
            id: "2",
            description: "Tuz va murch bilan aralashtiring"
          }
        ]
      }
    ]);
  }, []);

  // API function implementations
  const fetchExerciseBlocks = async () => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/exercise/api/exerciseblocks/');
      // const data = await response.json();
      // setExerciseBlocks(data);
      console.log("Fetching exercise blocks");
    } catch (error) {
      console.error("Error fetching exercise blocks:", error);
      toast.error("Mashqlarni yuklashda xatolik yuz berdi");
    }
  };

  const fetchMeals = async () => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/food/api/meals/');
      // const data = await response.json();
      // setMeals(data);
      console.log("Fetching meals");
    } catch (error) {
      console.error("Error fetching meals:", error);
      toast.error("Taomlarni yuklashda xatolik yuz berdi");
    }
  };

  const addExerciseBlock = async (block: Omit<ExerciseBlock, "id">) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/exercise/api/exerciseblocks/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(block)
      // });
      // const newBlock = await response.json();
      
      // Mock implementation
      const newBlock = {
        ...block,
        id: Date.now().toString()
      };
      
      setExerciseBlocks(prev => [...prev, newBlock as ExerciseBlock]);
      toast.success("Mashq bloki muvaffaqiyatli qo'shildi");
    } catch (error) {
      console.error("Error adding exercise block:", error);
      toast.error("Mashq blokini qo'shishda xatolik yuz berdi");
    }
  };

  const updateExerciseBlock = async (id: string, block: Partial<ExerciseBlock>) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/exercise/api/exerciseblocks/${id}/`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(block)
      // });
      
      // Mock implementation
      setExerciseBlocks(prev => 
        prev.map(item => item.id === id ? { ...item, ...block } : item)
      );
      toast.success("Mashq bloki muvaffaqiyatli yangilandi");
    } catch (error) {
      console.error("Error updating exercise block:", error);
      toast.error("Mashq blokini yangilashda xatolik yuz berdi");
    }
  };

  const deleteExerciseBlock = async (id: string) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/exercise/api/exerciseblocks/${id}/`, {
      //   method: 'DELETE'
      // });
      
      // Mock implementation
      setExerciseBlocks(prev => prev.filter(item => item.id !== id));
      toast.success("Mashq bloki muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Error deleting exercise block:", error);
      toast.error("Mashq blokini o'chirishda xatolik yuz berdi");
    }
  };

  const uploadExerciseBlockImage = async (id: string, file: File) => {
    try {
      // In a real app, this would be an API call
      // const formData = new FormData();
      // formData.append('image', file);
      // await fetch(`/api/exercise/api/exerciseblocks/${id}/upload-block-image/`, {
      //   method: 'POST',
      //   body: formData
      // });
      
      // Mock implementation
      const imageUrl = URL.createObjectURL(file);
      setExerciseBlocks(prev => 
        prev.map(item => item.id === id ? { ...item, image_url: imageUrl } : item)
      );
      toast.success("Rasm muvaffaqiyatli yuklandi");
    } catch (error) {
      console.error("Error uploading exercise block image:", error);
      toast.error("Rasmni yuklashda xatolik yuz berdi");
    }
  };

  const uploadExerciseStepImage = async (blockId: string, stepId: string, file: File) => {
    try {
      // In a real app, this would be an API call
      // const formData = new FormData();
      // formData.append('image', file);
      // await fetch(`/api/exercise/api/exerciseblocks/${blockId}/upload-exercise-image/${stepId}/`, {
      //   method: 'POST',
      //   body: formData
      // });
      
      // Mock implementation
      const imageUrl = URL.createObjectURL(file);
      setExerciseBlocks(prev => 
        prev.map(block => {
          if (block.id === blockId) {
            return {
              ...block,
              steps: block.steps.map(step => 
                step.id === stepId ? { ...step, image_url: imageUrl } : step
              )
            };
          }
          return block;
        })
      );
      toast.success("Qadam rasmi muvaffaqiyatli yuklandi");
    } catch (error) {
      console.error("Error uploading exercise step image:", error);
      toast.error("Qadam rasmini yuklashda xatolik yuz berdi");
    }
  };

  const addMeal = async (meal: Omit<Meal, "id">) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/food/api/meals/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(meal)
      // });
      // const newMeal = await response.json();
      
      // Mock implementation
      const newMeal = {
        ...meal,
        id: Date.now().toString()
      };
      
      setMeals(prev => [...prev, newMeal as Meal]);
      toast.success("Taom muvaffaqiyatli qo'shildi");
    } catch (error) {
      console.error("Error adding meal:", error);
      toast.error("Taomni qo'shishda xatolik yuz berdi");
    }
  };

  const updateMeal = async (id: string, meal: Partial<Meal>) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/food/api/meals/${id}/`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(meal)
      // });
      
      // Mock implementation
      setMeals(prev => 
        prev.map(item => item.id === id ? { ...item, ...meal } : item)
      );
      toast.success("Taom muvaffaqiyatli yangilandi");
    } catch (error) {
      console.error("Error updating meal:", error);
      toast.error("Taomni yangilashda xatolik yuz berdi");
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/food/api/meals/${id}/`, {
      //   method: 'DELETE'
      // });
      
      // Mock implementation
      setMeals(prev => prev.filter(item => item.id !== id));
      toast.success("Taom muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Error deleting meal:", error);
      toast.error("Taomni o'chirishda xatolik yuz berdi");
    }
  };

  const uploadMealImage = async (id: string, file: File) => {
    try {
      // In a real app, this would be an API call
      // const formData = new FormData();
      // formData.append('image', file);
      // await fetch(`/api/food/api/meals/${id}/upload-photo/`, {
      //   method: 'POST',
      //   body: formData
      // });
      
      // Mock implementation
      const imageUrl = URL.createObjectURL(file);
      setMeals(prev => 
        prev.map(item => item.id === id ? { ...item, image_url: imageUrl } : item)
      );
      toast.success("Rasm muvaffaqiyatli yuklandi");
    } catch (error) {
      console.error("Error uploading meal image:", error);
      toast.error("Rasmni yuklashda xatolik yuz berdi");
    }
  };

  return (
    <ContentContext.Provider
      value={{
        exerciseBlocks,
        meals,
        fetchExerciseBlocks,
        fetchMeals,
        addExerciseBlock,
        updateExerciseBlock,
        deleteExerciseBlock,
        uploadExerciseBlockImage,
        uploadExerciseStepImage,
        addMeal,
        updateMeal,
        deleteMeal,
        uploadMealImage
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
