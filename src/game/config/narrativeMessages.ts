import { SocialClass } from '../../types/Citizen'
import { Militancy } from '../../types/Militancy'

function pickRandom(phrases: string[]): string {
  return phrases[Math.floor(Math.random() * phrases.length)]
}

const socialPhraseData: Record<
  SocialClass,
  { grows: string[]; shrinks: string[] }
> = {
  [SocialClass.CLASE_MEDIA]: {
    grows: [
      'El barrio se gentrifica',
      'Los precios suben... y no solo los del pan',
      'Un aire de modernidad invade las calles',
      'El barrio cambia de cara poco a poco',
      'Los que tenían algo empiezan a tener más'
    ],
    shrinks: [
      'El sueldo no alcanza como antes',
      'La clase media empieza a desaparecer',
      'Los que tenían algo empiezan a perderlo',
      'El medio camino se achica',
      'Cada vuelta, menos gente aguanta'
    ]
  },
  [SocialClass.OBREROS]: {
    grows: [
      'La clase obrera se hace más visible',
      'El trabajo llama y más gente responde',
      'Los talleres se llenaron de manos',
      'El esfuerzo diario tiene más adeptos',
      'El barrio se llenó de sudor y trabajo'
    ],
    shrinks: [
      'Los trabajadores se dispersan',
      'Hay menos manos en los talleres',
      'El trabajo se vuelve escaso'
    ]
  },
  [SocialClass.ELITES]: {
    grows: [
      'La riqueza se acumula en las mismas manos',
      'Los de arriba siguen subiendo, como no',
      'El lujo crece donde siempre ha crecido',
      'Unos pocos acaparan cada vez más',
      'El dinero llama al dinero'
    ],
    shrinks: [
      'Los de arriba empiezan a temblar',
      'La riqueza se escapa de las manos de los pocos'
    ]
  },
  [SocialClass.DESPOSEIDOS]: {
    grows: [
      'La miseria se extiende por las calles',
      'Más gente cae en el olvido',
      'Las filas del hambre se alargan',
      'El barrio muestra sus heridas',
      'La necesidad toca más puertas esta vuelta'
    ],
    shrinks: [
      'La pobreza cede un poco de terreno',
      'Algunos olvidados encuentran un camino',
      'Del olvido emergen los que nadie veía',
      'Las calles quedan un poco menos desoladas',
      'La necesidad retrocede, aunque sea un paso'
    ]
  }
}

export const SocialPhrases = {
  pick(change: { socialClass: SocialClass; diff: number }): string {
    const direction = change.diff > 0 ? 'grows' : 'shrinks'
    return pickRandom(socialPhraseData[change.socialClass][direction])
  }
}

const militancyPhraseData: Record<Militancy, string[]> = {
  [Militancy.ANARQUISMO]: [
    'Las voces del cambio se hacen más fuertes',
    'El anarquismo gana terreno en el barrio',
    'Se oyen más gritos de libertad',
    'La conciencia obrera despierta',
    'Las ideas subversivas se corren por las calles',
    'El orden establecido temblequea'
  ],
  [Militancy.FASCISMO]: [
    'El miedo siembra la sociedad',
    'Las sombras del orden por la fuerza se alargan',
    'El miedo habla más alto que la razón',
    'La represión gana adeptos entre los asustados'
  ],
  [Militancy.STATUSQUO]: []
}

export const MilitancyPhrases = {
  pick(militancy: Militancy): string {
    return pickRandom(militancyPhraseData[militancy])
  }
}

const noChangePhraseData: string[] = [
  'La vida sigue su curso',
  'Nada se mueve por aquí',
  'Un día más, un día igual',
  'El barrio respira en calma'
]

export const NoChangePhrases = {
  pick(): string {
    return pickRandom(noChangePhraseData)
  }
}
