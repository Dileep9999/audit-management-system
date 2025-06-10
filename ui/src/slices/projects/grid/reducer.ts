import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { ProjectList } from "@src/dtos";
import { initStore } from "@src/utils/init_store";

interface ProjectGridState {
  projectgrid: ProjectList[];
  isLoading: boolean;
}

const initialState: ProjectGridState = {
  projectgrid: initStore("d-project-grid"),
  isLoading: false,
};

const ProjectSlice = createSlice({
  name: "projectgrid",
  initialState,
  reducers: {
    getProjectGrid(state, action: PayloadAction<ProjectList[]>) {
      state.projectgrid = action.payload;
    },
    deleteProjectGrid(state, action: PayloadAction<number[]>) {
      if (state.projectgrid !== null) {
        state.projectgrid = state.projectgrid.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },

    editProjectGrid(state, action: PayloadAction<ProjectList>) {
      const projectgrid = action.payload;
      if (state.projectgrid !== null) {
        const findProjectIndex = state.projectgrid.findIndex(
          (item) => item._id === projectgrid._id,
        );
        const findProjectRecord = state.projectgrid.find(
          (item) => item._id === projectgrid._id,
        );
        if (findProjectIndex !== -1 && findProjectRecord) {
          state.projectgrid[findProjectIndex] = projectgrid;
        }
        LoadingToast();
      }
    },

    addProjectGrid(state, action: PayloadAction<ProjectList>) {
      const newProject = action.payload;
      if (state.projectgrid !== null) {
        state.projectgrid.unshift(newProject);
      } else {
        state.projectgrid = [newProject];
      }
    },
  },
});

export const {
  getProjectGrid,
  addProjectGrid,
  editProjectGrid,
  deleteProjectGrid,
} = ProjectSlice.actions;
export default ProjectSlice.reducer;
