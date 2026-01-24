import { getRouteConfig } from "@/util/routeConfig";
import { useRouter } from "next/navigation";

export function useDeleteContent({ section, action, category, id }) {
  const router = useRouter();

  const deleteData = async () => {
    if (confirm("정말로 삭제하시겠습니까?")) {
      try {
        // 컬렉션명 결정
        const config = getRouteConfig(section, action, category, id);

        // 통합 API 엔드포인트
        const response = await fetch(config.endpoint, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // 리다이렉트 경로 결정

          // 캐시 무효화
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: config.revalidatePath }),
          });

          alert("성공적으로 삭제되었습니다.");
          router.push(config.redirectPath);
        } else {
          alert("삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("Error deleting data:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return { deleteData };
}
