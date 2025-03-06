
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";

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
  title?: string;
  step_time?: string;
  step_number?: number;
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
  meal_type?: "breakfast" | "lunch" | "snack" | "dinner";
}

// API types that match the backend requirements
interface ExerciseBlockAPI {
  id?: string | number;
  block_name: string;
  block_kkal: string;
  block_water_amount: string;
  description: string;
  video_url?: string;
  block_time: number;
  calories_burned: string;
  exercises: {
    id?: string | number;
    name: string;
    exercise_time: string;
    description: string;
    image_url?: string;
  }[];
  block_image_url?: string;
}

interface MealAPI {
  id?: string | number;
  meal_type: "breakfast" | "lunch" | "snack" | "dinner";
  food_name: string;
  calories: string;
  water_content: string;
  preparation_time: number;
  description?: string;
  video_url?: string;
  steps: {
    id?: string | number;
    title: string;
    text: string;
    step_time: string;
    step_number: number;
  }[];
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

// API base URLs
const EXERCISE_API_BASE = "/api/exercise/api/exerciseblocks";
const MEAL_API_BASE = "/api/food/api/meals";

// Headers
const getHeaders = () => {
  // Get the token from localStorage or another auth context
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

// Conversion functions between API and app models
const convertFromExerciseBlockAPI = (apiBlock: ExerciseBlockAPI): ExerciseBlock => {
  return {
    id: String(apiBlock.id),
    name: apiBlock.block_name,
    calories: parseFloat(apiBlock.block_kkal),
    water_intake: parseFloat(apiBlock.block_water_amount),
    duration: apiBlock.block_time,
    description: apiBlock.description,
    video_url: apiBlock.video_url,
    image_url: apiBlock.block_image_url,
    steps: apiBlock.exercises.map(exercise => ({
      id: String(exercise.id),
      name: exercise.name,
      duration: exercise.exercise_time,
      description: exercise.description,
      image_url: exercise.image_url
    }))
  };
};

const convertToExerciseBlockAPI = (block: Partial<ExerciseBlock>): Partial<ExerciseBlockAPI> => {
  return {
    block_name: block.name,
    block_kkal: block.calories?.toString(),
    block_water_amount: block.water_intake?.toString(),
    description: block.description,
    video_url: block.video_url,
    block_time: block.duration,
    calories_burned: block.calories?.toString(),
    exercises: block.steps?.map(step => ({
      name: step.name,
      exercise_time: step.duration,
      description: step.description
    }))
  };
};

const convertFromMealAPI = (apiMeal: MealAPI): Meal => {
  return {
    id: String(apiMeal.id),
    name: apiMeal.food_name,
    calories: parseFloat(apiMeal.calories),
    water_intake: parseFloat(apiMeal.water_content),
    preparation_time: apiMeal.preparation_time,
    description: apiMeal.description || "",
    video_url: apiMeal.video_url,
    meal_type: apiMeal.meal_type,
    steps: apiMeal.steps.map(step => ({
      id: String(step.id),
      title: step.title,
      description: step.text,
      step_time: step.step_time,
      step_number: step.step_number
    }))
  };
};

const convertToMealAPI = (meal: Partial<Meal>): Partial<MealAPI> => {
  return {
    meal_type: meal.meal_type || "breakfast",
    food_name: meal.name,
    calories: meal.calories?.toString(),
    water_content: meal.water_intake?.toString(),
    preparation_time: meal.preparation_time,
    description: meal.description,
    video_url: meal.video_url,
    steps: meal.steps?.map(step => ({
      title: step.title || "",
      text: step.description,
      step_time: "5",  // Default value if not provided
      step_number: step.step_number || 1
    }))
  };
};

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exerciseBlocks, setExerciseBlocks] = useState<ExerciseBlock[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);

  // Load mock data initially (will be replaced with API data)
  useEffect(() => {
    fetchExerciseBlocks();
    fetchMeals();
  }, []);

  // API function implementations
  const fetchExerciseBlocks = async () => {
    try {
      console.log("Fetching exercise blocks");
      const response = await axios.get(EXERCISE_API_BASE, {
        headers: getHeaders()
      });
      
      if (response.status === 200) {
        const apiBlocks = response.data;
        const blocks = Array.isArray(apiBlocks) 
          ? apiBlocks.map(convertFromExerciseBlockAPI)
          : [];
        setExerciseBlocks(blocks);
      }
    } catch (error) {
      console.error("Error fetching exercise blocks:", error);
      toast.error("Mashqlarni yuklashda xatolik yuz berdi");
      
      // Use mock data if API fails
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
    }
  };

  const fetchMeals = async () => {
    try {
      console.log("Fetching meals");
      const response = await axios.get(MEAL_API_BASE, {
        headers: getHeaders()
      });
      
      if (response.status === 200) {
        const apiMeals = response.data;
        const mealsList = Array.isArray(apiMeals) 
          ? apiMeals.map(convertFromMealAPI)
          : [];
        setMeals(mealsList);
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
      toast.error("Taomlarni yuklashda xatolik yuz berdi");
      
      // Use mock data if API fails
      setMeals([
        {
          id: "1",
          name: "Avokado va tuxumli buterbrod",
          calories: 1800,
          water_intake: 300,
          preparation_time: 20,
          description: "Bu yengil taomif tavsifi",
          meal_type: "breakfast",
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
    }
  };

  const addExerciseBlock = async (block: Omit<ExerciseBlock, "id">) => {
    try {
      const apiBlock = convertToExerciseBlockAPI(block);
      
      const response = await axios.post(EXERCISE_API_BASE + "/", apiBlock, {
        headers: getHeaders()
      });
      
      if (response.status === 201 || response.status === 200) {
        const newBlock = convertFromExerciseBlockAPI(response.data);
        setExerciseBlocks(prev => [...prev, newBlock]);
        toast.success("Mashq bloki muvaffaqiyatli qo'shildi");
        return;
      }
      
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error adding exercise block:", error);
      toast.error("Mashq blokini qo'shishda xatolik yuz berdi");
      
      // Mock implementation for development/demo purposes
      const newBlock = {
        ...block,
        id: Date.now().toString()
      };
      
      setExerciseBlocks(prev => [...prev, newBlock as ExerciseBlock]);
      toast.success("Mashq bloki muvaffaqiyatli qo'shildi (test mode)");
    }
  };

  const updateExerciseBlock = async (id: string, block: Partial<ExerciseBlock>) => {
    try {
      const apiBlock = convertToExerciseBlockAPI(block);
      
      const response = await axios.put(`${EXERCISE_API_BASE}/${id}/`, apiBlock, {
        headers: getHeaders()
      });
      
      if (response.status === 200) {
        const updatedBlock = convertFromExerciseBlockAPI(response.data);
        setExerciseBlocks(prev => 
          prev.map(item => item.id === id ? { ...item, ...updatedBlock } : item)
        );
        toast.success("Mashq bloki muvaffaqiyatli yangilandi");
        return;
      }
      
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error updating exercise block:", error);
      toast.error("Mashq blokini yangilashda xatolik yuz berdi");
      
      // Mock implementation for development/demo purposes
      setExerciseBlocks(prev => 
        prev.map(item => item.id === id ? { ...item, ...block } : item)
      );
      toast.success("Mashq bloki muvaffaqiyatli yangilandi (test mode)");
    }
  };

  const deleteExerciseBlock = async (id: string) => {
    try {
      const response = await axios.delete(`${EXERCISE_API_BASE}/${id}/`, {
        headers: getHeaders()
      });
      
      if (response.status === 204 || response.status === 200) {
        setExerciseBlocks(prev => prev.filter(item => item.id !== id));
        toast.success("Mashq bloki muvaffaqiyatli o'chirildi");
        return;
      }
      
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error deleting exercise block:", error);
      toast.error("Mashq blokini o'chirishda xatolik yuz berdi");
      
      // Mock implementation for development/demo purposes
      setExerciseBlocks(prev => prev.filter(item => item.id !== id));
      toast.success("Mashq bloki muvaffaqiyatli o'chirildi (test mode)");
    }
  };

  const uploadExerciseBlockImage = async (id: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('block_image', file);
      
      // Get the current block to include required fields
      const currentBlock = exerciseBlocks.find(block => block.id === id);
      if (!currentBlock) throw new Error("Block not found");
      
      // Add required fields to formData
      formData.append('block_name', currentBlock.name);
      formData.append('block_kkal', currentBlock.calories.toString());
      formData.append('block_water_amount', currentBlock.water_intake.toString());
      if (currentBlock.description) formData.append('description', currentBlock.description);
      if (currentBlock.video_url) formData.append('video_url', currentBlock.video_url);
      formData.append('block_time', currentBlock.duration.toString());
      formData.append('calories_burned', currentBlock.calories.toString());
      
      const response = await axios.post(`${EXERCISE_API_BASE}/${id}/upload-block-image/`, formData, {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 200) {
        const updatedBlock = convertFromExerciseBlockAPI(response.data);
        setExerciseBlocks(prev => 
          prev.map(item => item.id === id ? { ...item, image_url: updatedBlock.image_url } : item)
        );
        toast.success("Rasm muvaffaqiyatli yuklandi");
        return;
      }
      
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error uploading exercise block image:", error);
      toast.error("Rasmni yuklashda xatolik yuz berdi");
      
      // Mock implementation for development/demo purposes
      const imageUrl = URL.createObjectURL(file);
      setExerciseBlocks(prev => 
        prev.map(item => item.id === id ? { ...item, image_url: imageUrl } : item)
      );
      toast.success("Rasm muvaffaqiyatli yuklandi (test mode)");
    }
  };

  const uploadExerciseStepImage = async (blockId: string, stepId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Get the current block to include required fields
      const currentBlock = exerciseBlocks.find(block => block.id === blockId);
      if (!currentBlock) throw new Error("Block not found");
      
      // Add required fields to formData
      formData.append('block_name', currentBlock.name);
      formData.append('block_kkal', currentBlock.calories.toString());
      formData.append('block_water_amount', currentBlock.water_intake.toString());
      if (currentBlock.description) formData.append('description', currentBlock.description);
      if (currentBlock.video_url) formData.append('video_url', currentBlock.video_url);
      formData.append('block_time', currentBlock.duration.toString());
      formData.append('calories_burned', currentBlock.calories.toString());
      
      const response = await axios.post(
        `${EXERCISE_API_BASE}/${blockId}/upload-exercise-image/${stepId}/`, 
        formData, 
        {
          headers: {
            ...getHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.status === 200) {
        const updatedBlock = convertFromExerciseBlockAPI(response.data);
        const updatedStep = updatedBlock.steps.find(step => step.id === stepId);
        
        setExerciseBlocks(prev => 
          prev.map(block => {
            if (block.id === blockId) {
              return {
                ...block,
                steps: block.steps.map(step => 
                  step.id === stepId ? { ...step, image_url: updatedStep?.image_url } : step
                )
              };
            }
            return block;
          })
        );
        toast.success("Qadam rasmi muvaffaqiyatli yuklandi");
        return;
      }
      
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error uploading exercise step image:", error);
      toast.error("Qadam rasmini yuklashda xatolik yuz berdi");
      
      // Mock implementation for development/demo purposes
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
      toast.success("Qadam rasmi muvaffaqiyatli yuklandi (test mode)");
    }
  };

  const addMeal = async (meal: Omit<Meal, "id">) => {
    try {
      const apiMeal = convertToMealAPI(meal);
      
      const response = await axios.post(MEAL_API_BASE + "/", apiMeal, {
        headers: getHeaders()
      });
      
      if (response.status === 201 || response.status === 200) {
        const newMeal = convertFromMealAPI(response.data);
        setMeals(prev => [...prev, newMeal]);
        toast.success("Taom muvaffaqiyatli qo'shildi");
        return;
      }
      
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error adding meal:", error);
      toast.error("Taomni qo'shishda xatolik yuz berdi");
      
      // Mock implementation for development/demo purposes
      const newMeal = {
        ...meal,
        id: Date.now().toString()
      };
      
      setMeals(prev => [...prev, newMeal as Meal]);
      toast.success("Taom muvaffaqiyatli qo'shildi (test mode)");
    }
  };

  const updateMeal = async (id: string, meal: Partial<Meal>) => {
    try {
      const apiMeal = convertToMealAPI(meal);
      
      const response = await axios.put(`${MEAL_API_BASE}/${id}/`, apiMeal, {
        headers: getHeaders()
      });
      
      if (response.status === 200) {
        const updatedMeal = convertFromMealAPI(response.data);
        setMeals(prev => 
          prev.map(item => item.id === id ? { ...item, ...updatedMeal } : item)
        );
        toast.success("Taom muvaffaqiyatli yangilandi");
        return;
      }
      
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error updating meal:", error);
      toast.error("Taomni yangilashda xatolik yuz berdi");
      
      // Mock implementation for development/demo purposes
      setMeals(prev => 
        prev.map(item => item.id === id ? { ...item, ...meal } : item)
      );
      toast.success("Taom muvaffaqiyatli yangilandi (test mode)");
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      const response = await axios.delete(`${MEAL_API_BASE}/${id}/`, {
        headers: getHeaders()
      });
      
      if (response.status === 204 || response.status === 200) {
        setMeals(prev => prev.filter(item => item.id !== id));
        toast.success("Taom muvaffaqiyatli o'chirildi");
        return;
      }
      
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error deleting meal:", error);
      toast.error("Taomni o'chirishda xatolik yuz berdi");
      
      // Mock implementation for development/demo purposes
      setMeals(prev => prev.filter(item => item.id !== id));
      toast.success("Taom muvaffaqiyatli o'chirildi (test mode)");
    }
  };

  const uploadMealImage = async (id: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('food_photo', file);
      
      // Get the current meal to include required fields
      const currentMeal = meals.find(meal => meal.id === id);
      if (!currentMeal) throw new Error("Meal not found");
      
      // Add required fields to formData
      formData.append('meal_type', currentMeal.meal_type || 'breakfast');
      formData.append('food_name', currentMeal.name);
      formData.append('calories', currentMeal.calories.toString());
      formData.append('water_content', currentMeal.water_intake.toString());
      formData.append('preparation_time', currentMeal.preparation_time.toString());
      if (currentMeal.description) formData.append('description', currentMeal.description);
      if (currentMeal.video_url) formData.append('video_url', currentMeal.video_url);
      
      const response = await axios.post(`${MEAL_API_BASE}/${id}/upload-photo/`, formData, {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 200) {
        const updatedMeal = convertFromMealAPI(response.data);
        setMeals(prev => 
          prev.map(item => item.id === id ? { ...item, image_url: updatedMeal.image_url } : item)
        );
        toast.success("Rasm muvaffaqiyatli yuklandi");
        return;
      }
      
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error uploading meal image:", error);
      toast.error("Rasmni yuklashda xatolik yuz berdi");
      
      // Mock implementation for development/demo purposes
      const imageUrl = URL.createObjectURL(file);
      setMeals(prev => 
        prev.map(item => item.id === id ? { ...item, image_url: imageUrl } : item)
      );
      toast.success("Rasm muvaffaqiyatli yuklandi (test mode)");
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
