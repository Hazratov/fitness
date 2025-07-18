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
  duration: number | string;
  description: string;
  video_url?: string;
  image_url?: string;
  block_kkal?: string;
  block_water_amount?: string;
  calories_burned?: string;
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
  calories: string | number;
  water_intake: string | number;
  preparation_time: number;
  description: string;
  image_url?: string;
  video_url?: string;
  steps: MealPreparationStep[];
  meal_type: "breakfast" | "lunch" | "snack" | "dinner";
}

// API types that match the backend requirements
interface ExerciseBlockAPI {
  id?: string | number;
  block_name: string;
  description: string;
  video_url?: string;
  block_time: string;
  block_kkal?: string;
  block_water_amount?: string;
  calories_burned?: string;
  exercises: {
    id?: string | number;
    name: string;
    exercise_time: string;
    description: string;
    image_url?: string;
  }[];
  block_image_url?: string;
}

interface ExerciseStepAPI {
  id?: string | number;
  name: string;
  exercise_time: string;
  description: string;
  image_url?: string;
}

interface MealStepAPI {
  id?: string | number;
  title: string;
  text: string;
  step_time: string;
  step_number: number;
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
  steps: MealStepAPI[];
  food_photo_url?: string;
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
  updateExerciseStep: (stepId: string, data: Partial<ExerciseStep>) => Promise<void>;
  createExerciseStep: (blockId: string, step: Omit<ExerciseStep, "id">) => Promise<string>;
  updateMealStep: (stepId: string, data: Partial<MealPreparationStep>) => Promise<void>;
  createMealStep: (mealId: string, step: Omit<MealPreparationStep, "id">) => Promise<string>;
  fetchMealById: (id: string) => Promise<Meal | null>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

// API base URLs
const API_BASE_URL = "https://owntrainer.uz";
const EXERCISE_API_BASE = `${API_BASE_URL}/api/exercise/api/exerciseblocks`;
const EXERCISE_STEP_API_BASE = `${API_BASE_URL}/api/exercise/api/exercises`;
const MEAL_API_BASE = `${API_BASE_URL}/api/food/api/meals`;
const MEAL_STEP_API_BASE = `${API_BASE_URL}/api/food/api/meal-steps`;

// Headers
const getHeaders = () => {
  // Function to get cookie value by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return undefined;
  };

  // Try to get the token from cookies first, fall back to localStorage for backward compatibility
  const token = getCookie("accessToken") || localStorage.getItem("adminToken");

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
    duration: apiBlock.block_time || "0",
    description: apiBlock.description,
    video_url: apiBlock.video_url,
    block_kkal: apiBlock.block_kkal,
    block_water_amount: apiBlock.block_water_amount,
    calories_burned: apiBlock.calories_burned,
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
    description: block.description,
    video_url: block.video_url,
    block_time: String(block.duration || "0"),
    block_kkal: block.block_kkal,
    block_water_amount: block.block_water_amount,
    block_image_url: block.image_url,
    calories_burned: block.calories_burned,
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
    calories: apiMeal.calories || "0",
    water_intake: apiMeal.water_content || "0",
    preparation_time: apiMeal.preparation_time,
    description: apiMeal.description || "",
    video_url: apiMeal.video_url,
    meal_type: apiMeal.meal_type,
    image_url: apiMeal.food_photo_url,
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
    food_name: meal.name || "",
    calories: String(meal.calories || "0"),
    water_content: String(meal.water_intake || "0"),
    preparation_time: Number(meal.preparation_time || 0),
    description: meal.description,
    video_url: meal.video_url,
    steps: meal.steps?.map(step => ({
      title: step.title || "",
      text: step.description || "",
      step_time: step.step_time || "5",
      step_number: step.step_number || 1
    })) || []
  };
};

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exerciseBlocks, setExerciseBlocks] = useState<ExerciseBlock[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);

  // Load initial data
  useEffect(() => {
    fetchExerciseBlocks();
    fetchMeals();
  }, []);

  // API function implementations
  const fetchExerciseBlocks = async () => {
    try {
      console.log("Fetching exercise blocks from", EXERCISE_API_BASE);
      const response = await axios.get(EXERCISE_API_BASE, {
        headers: getHeaders()
      });
      
      if (response.status === 200) {
        const apiBlocks = response.data;
        console.log("Received exercise blocks:", apiBlocks);
        const blocks = Array.isArray(apiBlocks) 
          ? apiBlocks.map(convertFromExerciseBlockAPI)
          : [];
        setExerciseBlocks(blocks);
      }
    } catch (error) {
      console.error("Error fetching exercise blocks:", error);
      toast.error("Mashqlarni yuklashda xatolik yuz berdi");
      
      // Use mock data if API fails
      setExerciseBlocks([]);
    }
  };

  const fetchMealById = async (id: string) => {
    try {
      const response = await axios.get(`${MEAL_API_BASE}/${id}/`, {
        headers: getHeaders()
      });
      
      if (response.status === 200) {
        const apiMeal = response.data;
        console.log("Received meal:", apiMeal);
        const meal = convertFromMealAPI(apiMeal);
        return meal;
      }
      
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error fetching meal by ID:", error);
      toast.error("Taomni ID bo'yicha yuklashda xatolik yuz berdi");
      return null;
    }
  }

  const fetchMeals = async () => {
    try {
      const response = await axios.get(MEAL_API_BASE, {
        headers: getHeaders()
      });
      
      if (response.status === 200) {
        const apiMeals = response.data;
        console.log("Received meals:", apiMeals);
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
          calories: "1800",
          water_intake: "300",
          preparation_time: 20,
          description: "Bu yengil taom tavsifi",
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
      // Extract the image URL to handle it separately
      const { image_url, ...blockData } = block as any;
      const apiBlock = convertToExerciseBlockAPI(blockData);
      
      console.log("Sending exercise block data:", apiBlock);
      
      const response = await axios.post(EXERCISE_API_BASE + "/", apiBlock, {
        headers: getHeaders()
      });
      
      if (response.status === 201 || response.status === 200) {
        let newBlock = convertFromExerciseBlockAPI(response.data);
        
        // If there's an image URL provided, upload it in a separate request
        if (image_url && newBlock.id) {
          // Convert the base64 image to a File object
          const imageFile = await base64ToFile(image_url, 'block-image.png');
          await uploadExerciseBlockImage(newBlock.id, imageFile);
          
          // Fetch the block again to get the updated image URL
          const updatedBlock = await fetchExerciseBlockById(newBlock.id);
          if (updatedBlock) {
            newBlock = updatedBlock;
          }
        }
        
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
  
  // Helper function to convert base64 to File
  const base64ToFile = async (base64String: string, fileName: string): Promise<File> => {
    // Extract the MIME type and base64 data
    const parts = base64String.split(';base64,');
    const contentType = parts[0].split(':')[1] || 'image/png';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));
    
    for (let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    
    return new File([array], fileName, { type: contentType });
  };
  
  // Add this function to fetch a single exercise block by ID
  const fetchExerciseBlockById = async (id: string): Promise<ExerciseBlock | null> => {
    try {
      const response = await axios.get(`${EXERCISE_API_BASE}/${id}/`, {
        headers: getHeaders()
      });
      
      if (response.status === 200) {
        const apiBlock = response.data;
        console.log("Fetched block by ID:", apiBlock);
        return convertFromExerciseBlockAPI(apiBlock);
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching exercise block by ID:", error);
      return null;
    }
  };

  const updateExerciseBlock = async (id: string, block: Partial<ExerciseBlock>) => {
    try {
      const response = await axios.put(`${EXERCISE_API_BASE}/${id}/`, block, {
        headers: getHeaders()
      });
  
      if (response.status === 200) {
        setExerciseBlocks(prev => 
          prev.map(item => item.id === id ? { ...item, ...response.data } : item)
        );
        toast.success("Mashq bloki muvaffaqiyatli yangilandi");
        return;
      }
  
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error updating exercise block:", error);
      toast.error("Mashq blokini yangilashda xatolik yuz berdi");
  

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
      
      console.log("Uploading image for block ID:", id);
      console.log("FormData content:", formData);
      
      const response = await axios.patch(`${EXERCISE_API_BASE}/${id}/upload-block-image/`, formData, {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("Image upload response:", response.data);
      
      if (response.status === 200) {
        // Check what fields are available in the response
        const imageUrl = response.data.block_image_url || response.data.image_url || response.data.url;
        
        setExerciseBlocks(prev => 
          prev.map(item => item.id === id ? { ...item, image_url: imageUrl } : item)
        );
        
        toast.success("Rasm muvaffaqiyatli yuklandi");
        return;
      }
      
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error uploading exercise block image:", error);
      toast.error("Rasmni yuklashda xatolik yuz berdi");
      
      // Test rejimi uchun mock qilish
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
      
      const response = await axios.patch(
        `${EXERCISE_STEP_API_BASE}/${stepId}/upload-image/`, 
        formData, 
        {
          headers: {
            ...getHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.status === 200) {
        const updatedStepData = response.data;
        const imageUrl = updatedStepData.image_url;
        
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
      formData.append("food_photo", file);
  
      const response = await axios.patch(`${MEAL_API_BASE}/${id}/upload-photo/`, formData, {
        headers: {
          ...getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 200) {
        console.log("API Response:", response.data);  // API javobini tekshirish
  
        // API faqat `message` qaytargani sababli, `convertFromMealAPI` chaqirilmaydi
        setMeals((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, image_url: URL.createObjectURL(file) } : item
          )
        );
  
        toast.success("Rasm muvaffaqiyatli yuklandi");
        return;
      }
  
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error uploading meal image:", error);
      toast.error("Rasmni yuklashda xatolik yuz berdi");
    }
  };
  

  const updateExerciseStep = async (stepId: string, data: Partial<ExerciseStep>) => {
    try {
      const stepData = {
        name: data.name,
        exercise_time: data.duration,
        description: data.description
      };

      const response = await axios.patch(`${EXERCISE_STEP_API_BASE}/${stepId}/`, stepData, {
        headers: getHeaders()
      });
      
      if (response.status === 200) {
        // Update the local state after successful API call
        const updatedStepData = response.data;
        setExerciseBlocks(prev => 
          prev.map(block => ({
            ...block,
            steps: block.steps.map(step => 
              step.id === stepId ? {
                ...step,
                name: updatedStepData.name,
                duration: updatedStepData.exercise_time,
                description: updatedStepData.description,
                image_url: updatedStepData.image_url
              } : step
            )
          }))
        );
        toast.success("Mashq qadam muvaffaqiyatli yangilandi");
        return;
      }
      
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error updating exercise step:", error);
      toast.error("Mashq qadamini yangilashda xatolik yuz berdi");
      
      // Update local state anyway for UI consistency
      setExerciseBlocks(prev => 
        prev.map(block => ({
          ...block,
          steps: block.steps.map(step => 
            step.id === stepId ? { ...step, ...data } : step
          )
        }))
      );
    }
  };

  const createExerciseStep = async (blockId: string, step: Omit<ExerciseStep, "id">): Promise<string> => {
    try {
      const block = exerciseBlocks.find(b => b.id === blockId);
      if (!block) throw new Error("Block not found");
      
      const stepData = {
        exercise_block: blockId,
        name: step.name,
        exercise_time: step.duration,
        description: step.description,
        sequence_number: block.steps.length + 1
      };

      const response = await axios.post(EXERCISE_STEP_API_BASE + "/", stepData, {
        headers: getHeaders()
      });
      
      if (response.status === 201 || response.status === 200) {
        const newStep = {
          id: String(response.data.id),
          name: response.data.name,
          duration: response.data.exercise_time,
          description: response.data.description,
          image_url: response.data.image_url
        };
        
        // Update local state
        setExerciseBlocks(prev => 
          prev.map(b => b.id === blockId ? {
            ...b,
            steps: [...b.steps, newStep]
          } : b)
        );
        
        toast.success("Mashq qadami muvaffaqiyatli qo'shildi");
        return newStep.id;
      }
      
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error creating exercise step:", error);
      toast.error("Mashq qadamini qo'shishda xatolik yuz berdi");
      
      // For UI consistency, generate a temporary ID and update local state
      const tempId = `temp-${Date.now()}`;
      const newStep: ExerciseStep = { id: tempId, ...step };
      
      setExerciseBlocks(prev => 
        prev.map(b => b.id === blockId ? {
          ...b,
          steps: [...b.steps, newStep]
        } : b)
      );
      
      return tempId;
    }
  };

  const updateMealStep = async (stepId: string, data: Partial<MealPreparationStep>) => {
    try {
      const stepData = {
        title: data.title || "",
        text: data.description || "",
        step_time: data.step_time || "5",
        step_number: data.step_number || 1
      };

      const response = await axios.patch(`${MEAL_STEP_API_BASE}/${stepId}/`, stepData, {
        headers: getHeaders()
      });
      
      if (response.status === 200) {
        // Update the local state after successful API call
        const updatedStepData = response.data;
        setMeals(prev => 
          prev.map(meal => ({
            ...meal,
            steps: meal.steps.map(step => 
              step.id === stepId ? {
                ...step,
                title: updatedStepData.title,
                description: updatedStepData.text,
                step_time: updatedStepData.step_time,
                step_number: updatedStepData.step_number
              } : step
            )
          }))
        );
        toast.success("Taom tayyorlash qadami muvaffaqiyatli yangilandi");
        return;
      }
      
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error updating meal step:", error);
      toast.error("Taom tayyorlash qadamini yangilashda xatolik yuz berdi");
      
      // Update local state anyway for UI consistency
      setMeals(prev => 
        prev.map(meal => ({
          ...meal,
          steps: meal.steps.map(step => 
            step.id === stepId ? { ...step, ...data } : step
          )
        }))
      );
    }
  };

  const createMealStep = async (mealId: string, step: Omit<MealPreparationStep, "id">): Promise<string> => {
    try {
      const meal = meals.find(m => m.id === mealId);
      if (!meal) throw new Error("Meal not found");
      
      const stepData = {
        meal: mealId,
        title: step.title || "",
        text: step.description || "",
        step_time: step.step_time || "5",
        step_number: step.step_number || meal.steps.length + 1
      };

      const response = await axios.post(MEAL_STEP_API_BASE + "/", stepData, {
        headers: getHeaders()
      });
      
      if (response.status === 201 || response.status === 200) {
        const newStep = {
          id: String(response.data.id),
          title: response.data.title,
          description: response.data.text,
          step_time: response.data.step_time,
          step_number: response.data.step_number
        };
        
        // Update local state
        setMeals(prev => 
          prev.map(m => m.id === mealId ? {
            ...m,
            steps: [...m.steps, newStep]
          } : m)
        );
        
        toast.success("Taom tayyorlash qadami muvaffaqiyatli qo'shildi");
        return newStep.id;
      }
      
      throw new Error("Unexpected response status");
    } catch (error) {
      console.error("Error creating meal step:", error);
      toast.error("Taom tayyorlash qadamini qo'shishda xatolik yuz berdi");
      
      // For UI consistency, generate a temporary ID and update local state
      const tempId = `temp-${Date.now()}`;
      const newStep: MealPreparationStep = { id: tempId, ...step };
      
      setMeals(prev => 
        prev.map(m => m.id === mealId ? {
          ...m,
          steps: [...m.steps, newStep]
        } : m)
      );
      
      return tempId;
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
        uploadMealImage,
        updateExerciseStep,
        createExerciseStep,
        updateMealStep,
        createMealStep,
        fetchMealById
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
