import { Container } from "@/components/base/Container";
import { SectionHeading } from "@/components/base/SectionHeading";
import { CategoryTiles } from "@/components/catalog/CategoryTiles";
import { ProductShelf } from "@/components/catalog/ProductShelf";
import { Benefits } from "@/components/home/Benefits";
import { ButtonLink } from "@/components/ui/Button";
import { DISCOUNT_MIN_QTY, DISCOUNT_MIN_SUBTOTAL, DISCOUNT_PERCENT } from "@/constants/pricing";
import { getCategoryTree, getShelf } from "@/db/queries/catalog";
import { formatPrice } from "@/lib/format";

export default async function HomePage() {
  const [tree, sale, fresh, best, markdown] = await Promise.all([
    getCategoryTree(),
    getShelf("sale"),
    getShelf("new"),
    getShelf("bestseller"),
    getShelf("markdown"),
  ]);

  const shelves = [
    {
      id: "sale",
      title: "Акції",
      link: { href: "/catalog?sale=1", label: "Всі акції" },
      products: sale,
    },
    {
      id: "new",
      title: "Новинки",
      link: { href: "/catalog?new=1", label: "Всі новинки" },
      products: fresh,
    },
    {
      id: "best",
      title: "Бестселери",
      link: { href: "/catalog?bestseller=1", label: "Всі бестселери" },
      products: best,
    },
    {
      id: "markdown",
      title: "Уцінка",
      link: { href: "/catalog?cond=markdown", label: "Вся уцінка" },
      products: markdown,
    },
  ].filter((s) => s.products.length > 0);

  return (
    <main className="flex flex-col gap-10 py-4 lg:gap-16 lg:py-6">
      {/* Hero — one static slide until there are banners to rotate */}
      <Container>
        <section className="flex min-h-[480px] flex-col justify-center gap-4 rounded-xl bg-surface p-4 lg:min-h-[400px] lg:px-[72px]">
          <h1 className="max-w-[520px] text-[32px] leading-10 font-bold tracking-[-0.3px] lg:text-h1">
            Засоби захисту та витратні матеріали для роботи
          </h1>
          <p className="max-w-[520px] text-base text-ink-muted lg:text-lg">
            Рукавиці, респіратори, зварювальні щитки, круги та електроди в наявності на складі. −
            {DISCOUNT_PERCENT}% від {DISCOUNT_MIN_QTY} шт одного товару або від{" "}
            {formatPrice(DISCOUNT_MIN_SUBTOTAL)}.
          </p>
          <ButtonLink href="/catalog" className="w-full sm:w-fit">
            Перейти до каталогу
          </ButtonLink>
        </section>
      </Container>

      <Container>
        <section aria-labelledby="catalog">
          <SectionHeading
            id="catalog"
            title="Каталог"
            link={{ href: "/catalog", label: "Весь каталог" }}
          />
          <CategoryTiles categories={tree} />
        </section>
      </Container>

      {shelves.map((s) => (
        <Container key={s.id}>
          <ProductShelf {...s} />
        </Container>
      ))}

      <Container>
        <Benefits />
      </Container>

      <Container>
        <section className="flex flex-col gap-4 rounded-xl bg-inverse p-5 text-white lg:py-[84px] lg:pr-8 lg:pl-14">
          <h2 className="text-2xl font-bold lg:text-h2">Оптовим покупцям</h2>
          <p className="max-w-[664px] text-base opacity-85 lg:text-lg">
            Закуповуєте для підприємства або бригади? Надішліть перелік товарів і обсяги, і ми
            підготуємо пропозицію з індивідуальними цінами.
          </p>
          <ButtonLink href="/wholesale" className="w-full sm:w-fit">
            Запросити пропозицію
          </ButtonLink>
        </section>
      </Container>

      <Container>
        <section className="flex flex-col gap-4 lg:max-w-[608px]">
          <h2 className="text-2xl font-bold lg:text-h2">Про магазин «Цупко»</h2>
          <p className="text-ink-muted">
            Невеликий сімейний магазин із Дніпра. Ми розпродуємо складські залишки: рукавиці,
            респіратори, засоби для зварювання, абразиви та інший робочий інвентар — усе, що є в
            наявності, за чесними цінами.
          </p>
          <p className="text-ink-muted">
            Кількість обмежена, і закінчені позиції ми не довозимо, тож якщо щось потрібне — краще
            не відкладати. Відправляємо Новою поштою, Укрпоштою та Meest, а в Дніпрі можна забрати
            самостійно.
          </p>
          <ButtonLink href="/about" variant="ghost" className="w-fit px-0 hover:bg-transparent">
            Детальніше про магазин
          </ButtonLink>
        </section>
      </Container>
    </main>
  );
}
