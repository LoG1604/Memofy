import { supabase } from "./supabase";

export const uploadFile = async (
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  onProgress?.(10);

  const { data, error } = await supabase.storage
    .from("meetings")
    .upload(fileName, file);

  if (error) throw new Error(error.message);

  onProgress?.(100);

  const { data: urlData } = supabase.storage
    .from("meetings")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};

export const deleteFile = async (fileUrl: string): Promise<void> => {
  const path = fileUrl.split("/meetings/")[1];
  if (!path) return;
  await supabase.storage.from("meetings").remove([path]);
};
