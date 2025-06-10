import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import LoadingToast from "@src/components/custom/toast/loadingToast";
import { ProjectList } from "@src/dtos";
import { initStore } from "@src/utils/init_store";

interface ProjectListState {
  projectlist: ProjectList[];
  isLoading: boolean;
}

const initialState: ProjectListState = {
  projectlist: initStore("d-project-list"),
  isLoading: false,
};

const ProjectSlice = createSlice({
  name: "projectlist",
  initialState,
  reducers: {
    getProjectList(state, action: PayloadAction<ProjectList[]>) {
      state.projectlist = action.payload;
    },

    deleteProjectList(state, action: PayloadAction<number[]>) {
      if (state.projectlist !== null) {
        state.projectlist = state.projectlist.filter(
          (item) => !action.payload.includes(item._id),
        );
      }
    },

    editProjectList(state, action: PayloadAction<ProjectList>) {
      const projectlist = action.payload;
      if (state.projectlist !== null) {
        const findProjectIndex = state.projectlist.findIndex(
          (item) => item._id === projectlist._id,
        );
        const findProjectRecord = state.projectlist.find(
          (item) => item._id === projectlist._id,
        );
        if (findProjectIndex !== -1 && findProjectRecord) {
          state.projectlist[findProjectIndex] = projectlist;
        }
        LoadingToast();
      }
    },

    addProjectList(state, action: PayloadAction<ProjectList>) {
      const newProject = action.payload;
      if (state.projectlist !== null) {
        state.projectlist.unshift(newProject);
      } else {
        state.projectlist = [newProject];
      }
    },
  },
});

export const {
  getProjectList,
  addProjectList,
  editProjectList,
  deleteProjectList,
} = ProjectSlice.actions;
export default ProjectSlice.reducer;
