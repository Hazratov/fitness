
import React from "react";
import { Youtube, Clock } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUploader from "./ImageUploader";

// Form validation schema
export const exerciseSchema = z.object({
  name: z.string().min(3, "Kamida 3 ta belgi bo'lishi kerak"),
  description: z.string().min(10, "Kamida 10 ta belgi bo'lishi kerak"),
  video_url: z.string().optional(),
});

export type ExerciseFormValues = z.infer<typeof exerciseSchema>;

interface ExerciseFormProps {
  defaultValues?: ExerciseFormValues;
  mainImage: string | null;
  onImageUpload: (file: File) => void;
  form: ReturnType<typeof useForm<ExerciseFormValues>>;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({
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


          </div>
        </div>
      </form>
    </Form>
  );
};

export default ExerciseForm;
