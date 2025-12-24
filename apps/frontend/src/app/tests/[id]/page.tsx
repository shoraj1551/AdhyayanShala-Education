import { getTest } from '@/lib/api';
import TestRunner from '@/components/TestRunner';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function TestPage({ params }: Props) {
    const { id } = await params;
    const test = await getTest(id);

    if (!test) notFound();

    return (
        <div className="section-spacing container-narrow min-h-screen">
            <div className="mb-12 text-center">
                <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 block">
                    Assessment
                </span>
                <h1 className="text-3xl font-medium mb-4">{test.title}</h1>
                <p className="text-muted-foreground">
                    {test.questions.length} Questions • Untimed
                </p>
            </div>

            <TestRunner test={test} />
        </div>
    );
}
