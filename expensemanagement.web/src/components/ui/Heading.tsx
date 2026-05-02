
type HeadingProps = {
    HeadTitle: string;
    SubTitle?: string
}
export default function Heading({HeadTitle, SubTitle}: HeadingProps) {
    return (
        <div>
            <h2 className="text-4xl font-black tracking-tight text-on-surface mb-2">{HeadTitle}</h2>
            <p className="text-on-surface-variant font-medium">{SubTitle} </p>
        </div>
    )
}
