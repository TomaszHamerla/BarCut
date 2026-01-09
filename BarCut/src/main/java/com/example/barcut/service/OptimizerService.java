package com.example.barcut.service;

import com.example.barcut.model.BarResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class OptimizerService {

    public List<BarResult> calculateOptimization(List<Integer> requestedCuts, int stockLength) {
        List<Integer> sortedCuts = new ArrayList<>(requestedCuts);
        sortedCuts.sort(Collections.reverseOrder());

        List<BarWorkspace> openBars = new ArrayList<>();

        for (Integer cut : sortedCuts) {
            if (cut > stockLength) {
                throw new IllegalArgumentException("Cięcie " + cut + "mm jest dłuższe niż pręt (" + stockLength + "mm)!");
            }

            boolean placed = false;
            BarWorkspace bestFitBar = null;
            int minRemainingSpace = Integer.MAX_VALUE;

            for (BarWorkspace bar : openBars) {
                if (bar.canFit(cut)) {
                    int remaining = bar.currentSpace - cut;
                    if (remaining < minRemainingSpace) {
                        minRemainingSpace = remaining;
                        bestFitBar = bar;
                    }
                }
            }

            if (bestFitBar != null) {
                bestFitBar.addCut(cut);
                placed = true;
            }

            if (!placed) {
                BarWorkspace newBar = new BarWorkspace(stockLength);
                newBar.addCut(cut);
                openBars.add(newBar);
            }
        }

        List<BarResult> results = new ArrayList<>();

        for (BarWorkspace bw : openBars) {
            int usedSpace = bw.totalLength - bw.currentSpace;
            int finalLength = bw.totalLength;
            int stockReturn = 0;

            if (bw.totalLength == 6000 && usedSpace <= 3000) {
                finalLength = 3000;
                stockReturn = 3000;

                bw.currentSpace = finalLength - usedSpace;
            }
            else if (bw.totalLength == 12000 && usedSpace <= 6000) {
                finalLength = 6000;
                stockReturn = 6000;
                bw.currentSpace = finalLength - usedSpace;
            }

            results.add(new BarResult(finalLength, bw.cuts, bw.currentSpace, stockReturn));
        }

        return results;
    }

    private static class BarWorkspace {
        int totalLength;
        int currentSpace;
        List<Integer> cuts = new ArrayList<>();

        BarWorkspace(int length) {
            this.totalLength = length;
            this.currentSpace = length;
        }

        boolean canFit(int cut) { return currentSpace >= cut; }

        void addCut(int cut) {
            cuts.add(cut);
            currentSpace -= cut;
        }
    }
}