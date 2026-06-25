import { PhraseQuizGame } from "@/components/play/phrase-quiz-game";
import { RESPONSES } from "@/lib/play-extra";

export default function ResponseGame() {
  return (
    <PhraseQuizGame
      baseKey="response"
      titleJp="返事ゲーム"
      title="Responde"
      description="Escucha (o lee) lo que dicen y elige la respuesta natural. ¡Como una conversación real!"
      items={RESPONSES}
      audio
      accentChar="話"
    />
  );
}
