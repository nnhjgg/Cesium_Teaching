import { onMounted, onUnmounted, ref, watch } from "vue"
import { AActor } from "@/libs/AActor"
import * as THREE from 'three'

class Experiment extends AActor {
    private constructor() { super() }

    private static instance: Experiment = new Experiment()

    public static get Instance() { return this.instance }

    private canvas = ref<HTMLCanvasElement | null>(null)

    private renderer: THREE.WebGLRenderer | null = null;

    private isShow = ref<boolean>(false)

    private demoWindow = {
        isShow: false,
        label: '',
    }

    public InitStates() {
        return {
            canvas: this.canvas,
            isShow: this.isShow,
        }
    }

    public InitHooks() {

    }

    public Run() {
        onMounted(() => {
            this.CreateImGui()
        })
        onUnmounted(() => {
            this.Destroy()
        })
    }

    protected Destroy() {
        this.DestroyImGui()
    }

    private async CreateImGui() {
        if (this.canvas.value && Experiment.Instance.isShow.value) {
            //@ts-ignore
            await ImGui.default();

            ImGui.CreateContext();

            this.SetImGuiStyle()

            this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas.value });

            ImGui_Impl.Init(this.canvas.value);

            window.requestAnimationFrame(() => {
                this.DebugLoop()
            });
        }
    }

    private SetImGuiStyle() {
        let style = ImGui.GetStyle()
        style.Colors[ImGui.ImGuiCol.TitleBg] = new ImGui.ImVec4(0.08, 0.08, 0.08, 1)
        style.Colors[ImGui.ImGuiCol.TitleBgActive] = new ImGui.ImVec4(0.01, 0.6, 0.01, 1)
        style.Colors[ImGui.ImGuiCol.TitleBgCollapsed] = new ImGui.ImVec4(0.08, 0.08, 0.08, 1)
        style.Colors[ImGui.ImGuiCol.Separator] = new ImGui.ImVec4(0.01, 0.6, 0.6, 1)
        style.Colors[ImGui.ImGuiCol.WindowBg] = new ImGui.ImVec4(0.08, 0.08, 0.08, 1)
        style.Colors[ImGui.ImGuiCol.PopupBg] = new ImGui.ImVec4(0.08, 0.08, 0.08, 1)
        style.Colors[ImGui.ImGuiCol.FrameBg] = new ImGui.ImVec4(0.01, 0.3, 0.01, 1)
        style.Colors[ImGui.ImGuiCol.FrameBgHovered] = new ImGui.ImVec4(0.01, 0.6, 0.01, 1)
        style.Colors[ImGui.ImGuiCol.FrameBgActive] = new ImGui.ImVec4(0.01, 0.6, 0.01, 1)
        style.Colors[ImGui.ImGuiCol.CheckMark] = new ImGui.ImVec4(1, 1, 1, 1)
        style.Colors[ImGui.ImGuiCol.Button] = new ImGui.ImVec4(0.01, 0.3, 0.01, 1)
        style.Colors[ImGui.ImGuiCol.ButtonHovered] = new ImGui.ImVec4(0.01, 0.6, 0.01, 1)
        style.Colors[ImGui.ImGuiCol.ButtonActive] = new ImGui.ImVec4(0.01, 0.6, 0.01, 1)
        style.Colors[ImGui.ImGuiCol.Text] = new ImGui.ImVec4(1, 1, 1, 1)
    }

    private DestroyImGui() {
        ImGui_Impl.Shutdown();
        ImGui.DestroyContext();
    }

    private DebugLoop(time: number = 0.016) {
        if (this.isShow.value) {
            ImGui_Impl.NewFrame(time);
            ImGui.NewFrame();

            this.DrawMainWindow()
            this.DrawDemoWindow()

            ImGui.EndFrame();
            ImGui.Render();

            ImGui_Impl.RenderDrawData(ImGui.GetDrawData());
            this.renderer?.state.reset();

            window.requestAnimationFrame((time: number) => {
                this.DebugLoop(time)
            });
        }
    }

    private DrawMainWindow() {
        ImGui.SetNextWindowPos(new ImGui.ImVec2(100, 100), ImGui.ImGuiCond.FirstUseEver);
        ImGui.SetNextWindowSize(new ImGui.ImVec2(600, 300), ImGui.ImGuiCond.FirstUseEver);

        ImGui.Begin("Experiment", (value = this.isShow.value) => this.isShow.value = value);

        ImGui.Checkbox("Demo Window", (value = this.demoWindow.isShow) => this.demoWindow.isShow = value);

        ImGui.End();
    }

    private DrawDemoWindow() {
        if (this.demoWindow.isShow) {
            ImGui.Begin("Demo Window", (value = this.demoWindow.isShow) => this.demoWindow.isShow = value);
            ImGui.Text("Demo Window")
            ImGui.InputText("Label", (value = this.demoWindow.label) => this.demoWindow.label = value);
            ImGui.End();
        }
    }
}

export { Experiment }