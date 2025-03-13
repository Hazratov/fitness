import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ImagePlus, Plus, X, Upload, Youtube, Clock, Droplets, Flame, 
  ArrowLeft, Check, Home, FileText
} from "lucide-react";
import { useContent, ExerciseStep, MealPreparationStep } from "@/contexts/ContentContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type ContentType = "mashqlar" | "taomnnoma";

// Form validation schemas
const exerciseSchema = z.object({
  name: z.string().min(3, "Kamida 3 ta belgi bo'lishi kerak"),
  duration: z.coerce.number().min(1, "Davomiyligi 1 daqiqadan kam bo'lmasligi kerak"),
  description: z.string().min(10, "Kamida 10 ta belgi bo'lishi kerak"),
  video_url: z.string().optional(),
});

const mealSchema = z.object({
  name: z.string().trim().min(3, "Kamida 3 ta belgi bo'lishi kerak"),
  calories: z.string().min(0, "Kaloriya 0 dan kam bo'lmasligi kerak"),
  water_intake: z.string().min(0, "Suv istimoli 0 dan kam bo'lmasligi kerak"),
  preparation_time: z.coerce.number().min(1, "Tayyorlash vaqti 1 daqiqadan kam bo'lmasligi kerak"),
  description: z.string().trim().min(10, "Kamida 10 ta belgi bo'lishi kerak"),
  video_url: z.string().optional(),
  meal_type: z.enum(["breakfast", "lunch", "snack", "dinner"]).default("breakfast"),
});

const AddEditContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const { 
    exerciseBlocks, 
    meals, 
    addExerciseBlock, 
    updateExerciseBlock, 
    uploadExerciseBlockImage,
    uploadExerciseStepImage,
    addMeal,
    updateMeal,
    uploadMealImage
  } = useContent();

  // State
  const [contentType, setContentType] = useState<ContentType>("mashqlar");
  const [steps, setSteps] = useState<(ExerciseStep | MealPreparationStep)[]>([]);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [stepImages, setStepImages] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Forms
  const exerciseForm = useForm<z.infer<typeof exerciseSchema>>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      duration: 40,
      description: "",
      video_url: "",
    },
    mode: "onChange"
  });

  const mealForm = useForm<z.infer<typeof mealSchema>>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      name: "",
      calories: "0",
      water_intake: "0",
      preparation_time: 20,
      description: "",
      video_url: "",
      meal_type: "breakfast",
    },
    mode: "onChange"
  });

  // Open dialog for content type selection when adding new content
  useEffect(() => {
    if (!isEditMode) {
      setIsDialogOpen(true);
    }
  }, [isEditMode]);

  // Load existing data for editing
  useEffect(() => {
    if (isEditMode && id) {
      const exerciseBlock = exerciseBlocks.find(block => block.id === id);
      const meal = meals.find(meal => meal.id === id);

      if (exerciseBlock) {
        setContentType("mashqlar");
        exerciseForm.reset({
          name: exerciseBlock.name,
          duration: typeof exerciseBlock.duration === 'number' ? exerciseBlock.duration : parseInt(exerciseBlock.duration as string) || 0,
          description: exerciseBlock.description,
          video_url: exerciseBlock.video_url || "",
        });
        setSteps(exerciseBlock.steps);
        if (exerciseBlock.image_url) setMainImage(exerciseBlock.image_url);

        // Set step images
        const stepImgMap: Record<string, string> = {};
        exerciseBlock.steps.forEach(step => {
          if (step.image_url) stepImgMap[step.id] = step.image_url;
        });
        setStepImages(stepImgMap);
      } else if (meal) {
        setContentType("taomnnoma");
        mealForm.reset({
          name: meal.name,
          calories: String(meal.calories || "0"),
          water_intake: String(meal.water_intake || "0"),
          preparation_time: typeof meal.preparation_time === 'number' ? meal.preparation_time : parseInt(String(meal.preparation_time)) || 0,
          description: meal.description,
          video_url: meal.video_url || "",
          meal_type: meal.meal_type,
        });
        setSteps(meal.steps);
        if (meal.image_url) setMainImage(meal.image_url);
      }
    }
  }, [id, exerciseBlocks, meals, isEditMode, exerciseForm, mealForm]);

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setMainImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (isEditMode && id) {
      if (contentType === "mashqlar") {
        uploadExerciseBlockImage(id, file);
      } else {
        uploadMealImage(id, file);
      }
    }
  };

  const handleStepImageUpload = (stepId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setStepImages(prev => ({ ...prev, [stepId]: reader.result as string }));
    };
    reader.readAsDataURL(file);

    if (isEditMode && id && contentType === "mashqlar") {
      uploadExerciseStepImage(id, stepId, file);
    }
  };

  const addStep = () => {
    const newStepId = crypto.randomUUID();
    
    if (contentType === "mashqlar") {
      const newStep: ExerciseStep = {
        id: newStepId,
        name: "",
        duration: "5 - 10 daqiqa",
        description: "",
      };
      setSteps(prev => [...prev, newStep]);
    } else {
      const newStep: MealPreparationStep = {
        id: newStepId,
        description: "",
        title: "",
        step_time: "5",
        step_number: steps.length + 1,
      };
      setSteps(prev => [...prev, newStep]);
    }
  };

  const updateStep = (id: string, data: Partial<ExerciseStep | MealPreparationStep>) => {
    setSteps(prev =>
      prev.map(step => (step.id === id ? { ...step, ...data } : step))
    );
  };

  const removeStep = (id: string) => {
    setSteps(prev => prev.filter(step => step.id !== id));
    
    // Also remove any associated images
    if (stepImages[id]) {
      const newStepImages = { ...stepImages };
      delete newStepImages[id];
      setStepImages(newStepImages);
    }
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (contentType === "mashqlar") {
        const isValid = await exerciseForm.trigger();
        if (!isValid) {
          setIsSubmitting(false);
          return;
        }

        const formData = exerciseForm.getValues();
        
        const exerciseData = {
          name: formData.name,
          duration: formData.duration,
          description: formData.description,
          video_url: formData.video_url,
          steps: steps as ExerciseStep[],
          image_url: mainImage || undefined,
        };

        if (isEditMode && id) {
          await updateExerciseBlock(id, exerciseData);
        } else {
          await addExerciseBlock(exerciseData);
        }
      } else {
        const isValid = await mealForm.trigger();
        if (!isValid) {
          setIsSubmitting(false);
          return;
        }

        const formData = mealForm.getValues();
        
        const mealData = {
          name: formData.name,
          calories: formData.calories,
          water_intake: formData.water_intake,
          preparation_time: formData.preparation_time,
          description: formData.description,
          video_url: formData.video_url,
          meal_type: formData.meal_type,
          steps: steps as MealPreparationStep[],
          image_url: mainImage || undefined,
        };

        if (isEditMode && id) {
          await updateMeal(id, mealData);
        } else {
          await addMeal(mealData);
        }
      }

      toast.success(isEditMode ? "Muvaffaqiyatli yangilandi" : "Muvaffaqiyatli qo'shildi");
      navigate("/content");
    } catch (error) {
      toast.error("Xatolik yuz berdi");
      console.error("Error saving content:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white">
      <div className="bg-[#1a2336] py-3 px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="text-xl font-bold">Fitness Admin</div>
        <div className="flex items-center gap-4">
          <button 
            className="flex items-center gap-2 bg-[#252e3f] hover:bg-[#2c374d] px-4 py-2 rounded-full"
            onClick={() => navigate("/dashboard")}
          >
            <Home size={18} />
            <span>Asosiy</span>
          </button>
          <button 
            className="flex items-center gap-2 bg-[#252e3f] hover:bg-[#2c374d] px-4 py-2 rounded-full"
            onClick={() => navigate("/content")}
          >
            <FileText size={18} />
            <span>Kontentlar</span>
          </button>
          <button 
            className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d54cf] px-4 py-2 rounded-full"
          >
            <Plus size={18} />
            <span>Qo'shish</span>
          </button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1a2336] border-[#2c3855] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Kontent qo'shish</DialogTitle>
            <DialogDescription className="text-gray-400">
              Qo'shmoqchi bo'lgan kontent turini tanlang
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <RadioGroup 
              defaultValue={contentType} 
              onValueChange={(value) => setContentType(value as ContentType)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mashqlar" id="mashqlar" />
                <Label htmlFor="mashqlar">Mashqlar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="taomnnoma" id="taomnnoma" />
                <Label htmlFor="taomnnoma">Taomnnoma</Label>
              </div>
            </RadioGroup>
            <div className="flex justify-end">
              <Button 
                onClick={() => setIsDialogOpen(false)} 
                className="bg-[#2563eb] hover:bg-[#1d54cf]"
              >
                Davom etish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <button 
            className="p-2 rounded-full bg-[#1e293b] hover:bg-[#283548]"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Kontentni tahrirlash" : "Kontent qo'shish"}
          </h1>
        </div>

        <div className="bg-[#1a2336] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">
            {contentType === "mashqlar" ? "Mashq turi" : "Taom turi"}
          </h2>

          {contentType === "mashqlar" ? (
            <Form {...exerciseForm}>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
                <div className="grid md:grid-cols-1 gap-6">
                  <FormField
                    control={exerciseForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sarlavha</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Yurish mashqlari" 
                            className="bg-[#131c2e] border-[#2c3855] focus-visible:ring-[#3b82f6]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rasm yuklash</label>
                    <div 
                      className={`
                        border-2 border-dashed rounded-lg p-4 h-64 flex flex-col items-center justify-center
                        ${mainImage ? 'border-[#2c3855]' : 'border-[#3b82f6] border-opacity-50 hover:border-opacity-100'}
                        transition-all cursor-pointer bg-[#131c2e]
                      `}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {mainImage ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={mainImage} 
                            alt="Upload preview" 
                            className="w-full h-full object-cover rounded-md"
                          />
                          <button 
                            className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMainImage(null);
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <ImagePlus size={48} className="mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-400">Rasm yuklash</p>
                          <p className="text-xs text-gray-500 mt-1">Rasmning formati JPG yoki PNG, o'lchami max: 5MB</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleMainImageUpload}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={exerciseForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tavsif</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Bu o'rta darajadagi mashq bo'lib, yurish va yurak mushaklarini yaxshilaydi..."
                              className="bg-[#131c2e] border-[#2c3855] focus-visible:ring-[#3b82f6] h-16"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={exerciseForm.control}
                      name="video_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video havolasi</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ" 
                                className="bg-[#131c2e] border-[#2c3855] focus-visible:ring-[#3b82f6] pl-10"
                                {...field}
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Youtube size={16} />
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={exerciseForm.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vaqti (daq)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number"
                                className="bg-[#131c2e] border-[#2c3855] focus-visible:ring-[#3b82f6] pl-10"
                                {...field}
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Clock size={16} />
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...mealForm}>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
                <div className="grid md:grid-cols-1 gap-6">
                  <FormField
                    control={mealForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sarlavha</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Avokado va tuxumli buterbrod" 
                            className="bg-[#131c2e] border-[#2c3855] focus-visible:ring-[#3b82f6]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rasm yuklash</label>
                    <div 
                      className={`
                        border-2 border-dashed rounded-lg p-4 h-64 flex flex-col items-center justify-center
                        ${mainImage ? 'border-[#2c3855]' : 'border-[#3b82f6] border-opacity-50 hover:border-opacity-100'}
                        transition-all cursor-pointer bg-[#131c2e]
                      `}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {mainImage ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={mainImage} 
                            alt="Upload preview" 
                            className="w-full h-full object-cover rounded-md"
                          />
                          <button 
                            className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMainImage(null);
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <ImagePlus size={48} className="mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-400">Rasm yuklash</p>
                          <p className="text-xs text-gray-500 mt-1">Rasmning formati JPG yoki PNG, o'lchami max: 5MB</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleMainImageUpload}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={mealForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tavsif</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Bu yengil taom tavsifi..."
                              className="bg-[#131c2e] border-[#2c3855] focus-visible:ring-[#3b82f6] h-16"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={mealForm.control}
                      name="video_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video havolasi</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ" 
                                className="bg-[#131c2e] border-[#2c3855] focus-visible:ring-[#3b82f6] pl-10"
                                {...field}
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Youtube size={16} />
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={mealForm.control}
                        name="preparation_time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vaqti (daq)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number"
                                  className="bg-[#131c2e] border-[#2c3855] focus-visible:ring-[#3b82f6] pl-10"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? '0' : e.target.value;
                                    field.onChange(parseInt(value) || 0);
                                  }}
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                  <Clock size={16} />
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={mealForm.control}
                        name="calories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kaloriya</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="text"
                                  className="bg-[#131c2e] border-[#2c3855] focus-visible:ring-[#3b82f6] pl-10"
                                  {...field}
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                  <Flame size={16} />
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={mealForm.control}
                        name="water_intake"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suv (ml)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="text"
                                  className="bg-[#131c2e] border-[#2c3855] focus-visible:ring-[#3b82f6] pl-10"
                                  {...field}
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                  <Droplets size={16} />
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={mealForm.control}
                    name="meal_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taom turi</FormLabel>
                        <FormControl>
                          <select
                            className="w-full bg-[#131c2e] border-[#2c3855] text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                            {...field}
                          >
                            <option value="breakfast">Nonushta</option>
                            <option value="lunch">Tushlik</option>
                            <option value="dinner">Kechki ovqat</option>
                            <option value="snack">Yengil tamaddi</option>
                          </select>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          )}
        </div>

        <div className="bg-[#1a2336] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">
            {contentType === "mashqlar" ? "Mashqlar ketma ketligi kiritish" : "Tayyorlash ketma ketligi kiritish"}
          </h2>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className="p-4 bg-[#131c2e] rounded-lg border border-[#2c3855]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center bg-[#1a2336] text-[#3b82f6] w-8 h-8 rounded-full font-semibold">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {contentType === "mashqlar" && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Mashq nomi</label>
                          <Input 
                            type="text" 
                            placeholder="Isitish"
                            className="bg-[#1a2336] border-[#2c3855] focus-visible:ring-[#3b82f6]"
                            value={(step as ExerciseStep).name || ""}
                            onChange={(e) => updateStep(step.id, { name: e.target.value })}
                          />
                        </div>
                      )}

                      {contentType === "mashqlar" && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Davomiyligi</label>
                          <Input 
                            type="text" 
                            placeholder="5 - 10 daqiqa"
                            className="bg-[#1a2336] border-[#2c3855] focus-visible:ring-[#3b82f6]"
                            value={(step as ExerciseStep).duration || ""}
                            onChange={(e) => updateStep(step.id, { duration: e.target.value })}
                          />
                        </div>
                      )}

                      {contentType === "taomnnoma" && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Qadam sarlavhasi</label>
                          <Input 
                            type="text" 
                            placeholder="Tayyorgarlik"
                            className="bg-[#1a2336] border-[#2c3855] focus-visible:ring-[#3b82f6]"
                            value={(step as MealPreparationStep).title || ""}
                            onChange={(e) => updateStep(step.id, { title: e.target.value })}
                          />
                        </div>
                      )}

                      {contentType === "taomnnoma" && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Qadam vaqti (daqiqa)</label>
                          <Input 
                            type="text" 
                            placeholder="5"
                            className="bg-[#1a2336] border-[#2c3855] focus-visible:ring-[#3b82f6]"
                            value={(step as MealPreparationStep).step_time || ""}
                            onChange={(e) => updateStep(step.id, { step_time: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Tavsif</label>
                      <Textarea 
                        placeholder={
                          contentType === "mashqlar" 
                            ? "Yengil yurish yoki joggingni oqrgani uchun mashqlar" 
                            : "Tuxumlarni suvda qaynatring yoki pishiring qiling"
                        }
                        className="bg-[#1a2336] border-[#2c3855] focus-visible:ring-[#3b82f6] h-16"
                        value={(step as any).description || ""}
                        onChange={(e) => updateStep(step.id, { description: e.target.value })}
                      />
                    </div>

                    {contentType === "mashqlar" && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Rasm yuklash</label>
                        <div 
                          className={`
                            border-2 border-dashed rounded-lg p-4 h-40 flex flex-col items-center justify-center
                            ${stepImages[step.id] ? 'border-[#2c3855]' : 'border-[#3b82f6] border-opacity-50 hover:border-opacity-100'}
                            transition-all cursor-pointer bg-[#1a2336]
                          `}
                          onClick={() => stepFileInputRefs.current[step.id]?.click()}
                        >
                          {stepImages[step.id] ? (
                            <div className="relative w-full h-full">
                              <img 
                                src={stepImages[step.id]} 
                                alt="Upload preview" 
                                className="w-full h-full object-cover rounded-md"
                              />
                              <button 
                                className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newStepImages = { ...stepImages };
                                  delete newStepImages[step.id];
                                  setStepImages(newStepImages);
                                }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-gray-400">Mashq rasmi yuklash</p>
                            </div>
                          )}
                          <input 
                            type="file" 
                            ref={(ref) => {
                              stepFileInputRefs.current[step.id] = ref;
                            }}
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleStepImageUpload(step.id, e)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    className="p-2 rounded-full hover:bg-[#283548] text-red-400"
                    onClick={() => removeStep(step.id)}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}

            <button 
              className="w-full py-3 bg-[#131c2e] hover:bg-[#1e293b] rounded-lg border border-[#2c3855] flex items-center justify-center gap-2 text-sm font-medium"
              onClick={addStep}
            >
              <Plus size={16} />
              <span>Qadam qo'shish</span>
            </button>
          </div>
        </div>

        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-6 bg-[#2563eb] hover:bg-[#1d54cf] text-white font-medium rounded-lg flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>Yuklanmoqda...</span>
          ) : (
            <>
              <Check size={20} />
              <span>{isEditMode ? "Saqlash va chiqib ketish" : "Yaratish va chiqib ketish"}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddEditContent;
