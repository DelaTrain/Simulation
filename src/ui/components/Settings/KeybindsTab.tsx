export default function KeybindsTab() {
    return (
        <div className="flex flex-col gap-4 w-full">
            <table className="table-fixed border-collapse table-bordered text-center ">
                <tr>
                    <td>
                        <kbd className="inline-block bg-stone-700 border rounded px-1 mx-1 border-stone-400 text-stone-400">
                            Space
                        </kbd>
                    </td>
                    <td>
                        <span className="px-4">Toggle Auto-Run</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <kbd className="inline-block bg-stone-700 border rounded px-1 mx-1 border-stone-400 text-stone-400">
                            R
                        </kbd>
                    </td>
                    <td>
                        <span className="px-4">Reset Simulation</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <kbd className="inline-block bg-stone-700 border rounded px-1 mx-1 border-stone-400 text-stone-400">
                            Enter
                        </kbd>
                    </td>
                    <td>
                        <span className="px-4">Step Simulation</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <kbd className="inline-block bg-stone-700 border rounded px-1 mx-1 border-stone-400 text-stone-400">
                            Ctrl
                        </kbd>
                        +
                        <kbd className="inline-block bg-stone-700 border rounded px-1 mx-1 border-stone-400 text-stone-400">
                            /
                        </kbd>
                    </td>
                    <td>
                        <span className="px-4">Focus Search Bar</span>
                    </td>
                </tr>
            </table>
        </div>
    );
}
