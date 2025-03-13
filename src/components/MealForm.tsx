
import React from "react";
import { Youtube, Clock, Droplets, Flame } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUploader from "./ImageUploader";

// Form validation schema
export const mealSchema = z.object({
  name: z.string().trim().min(3, "Kamida 3 ta belgi bo'lishi kerak"),
  calories: z.string().min(0, "Kaloriya 0 dan kam bo'lmasligi kerak"),
  water_intake: z.string().min(0, "Suv istimoli 0 dan kam bo'lmasligi kerak"),
  preparation_time: z.coerce.number().min(1, "Tayyorlash vaqti 1 daqiqadan kam bo'lmasligi kerak"),
  description: z.string().trim().min(10, "Kamida 10 ta belgi bo'lishi kerak"),
  video_url: z.string().optional(),
  meal_type: z.enum(["breakfast", "lunch", "snack", "dinner"]).default("breakfast"),
});

export type MealFormValues = z.infer<typeof mealSchema>;

interface MealFormProps {
  defaultValues?: MealFormValues;
  mainImage: string | null;
  onImageUpload: (file: File) => void;
  form: ReturnType<typeof useForm<MealFormValues>>;
}

const MealForm: React.FC<MealFormProps> = ({
  mainImage,
  onImageUpload,
  form
}) => {
  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="grid md:grid-cols-1 gap-6">
          <FormField
            control={form.control}
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
            <ImageUploader 
              imageUrl={mainImage}
              onImageUpload={onImageUpload}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
            control={form.control}
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
  );
};

export default MealForm;
